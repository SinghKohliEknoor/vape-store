// // app/(protected)/api/chat/route.js
// import { NextResponse } from "next/server";
// import { supabase } from "@/lib/supabaseClient";

// const FUNCTIONS = [
//   {
//     name: "get_products",
//     description: "Retrieve all products in the Vape Vault inventory",
//     parameters: {
//       type: "object",
//       properties: {},
//       additionalProperties: false,
//     },
//   },
//   {
//     name: "get_product_by_id",
//     description: "Retrieve details for a single product by ID",
//     parameters: {
//       type: "object",
//       properties: {
//         product_id: { type: "string", description: "Product UUID" },
//       },
//       required: ["product_id"],
//     },
//   },
// ];

// export async function POST(req) {
//   const { messages } = await req.json();

//   // 1️⃣ First GPT call: ask it what it wants to do
//   const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//     },
//     body: JSON.stringify({
//       model: "gpt-4-turbo", // or your chosen model
//       messages,
//       functions: FUNCTIONS,
//       function_call: "auto",
//     }),
//   });
//   const openaiJson = await openaiRes.json();
//   const choice = openaiJson.choices?.[0]?.message;

//   // 2️⃣ If GPT didn’t call a function, just return its response
//   if (!choice?.function_call) {
//     return NextResponse.json(openaiJson, { status: openaiRes.status });
//   }

//   // 3️⃣ GPT wants to call a function — parse name & args
//   const { name, arguments: argsJson } = choice.function_call;
//   const fnArgs = JSON.parse(argsJson || "{}");

//   let functionResult;
//   try {
//     if (name === "get_products") {
//       const { data, error } = await supabase.from("products").select("*");
//       if (error) throw error;
//       functionResult = data;
//     } else if (name === "get_product_by_id") {
//       const { product_id } = fnArgs;
//       const { data, error } = await supabase
//         .from("products")
//         .select("*")
//         .eq("id", product_id)
//         .single();
//       if (error) throw error;
//       functionResult = data;
//     } else {
//       functionResult = { error: `Unknown function: ${name}` };
//     }
//   } catch (err) {
//     functionResult = { error: err.message || "Function execution error" };
//   }

//   // 4️⃣ Second GPT call: give it the function result so it can craft a reply
//   const followUpRes = await fetch(
//     "https://api.openai.com/v1/chat/completions",
//     {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//       },
//       body: JSON.stringify({
//         model: "gpt-4-turbo",
//         messages: [
//           ...messages,
//           choice, // the function call
//           { role: "function", name, content: JSON.stringify(functionResult) },
//         ],
//       }),
//     }
//   );
//   const followUpJson = await followUpRes.json();
//   return NextResponse.json(followUpJson, { status: followUpRes.status });
// }

// app/(protected)/api/chat/route.js
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

const FUNCTIONS = [
  {
    name: "search_products",
    description: "Find products matching a natural-language query",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "User’s search text" },
        k: {
          type: "integer",
          description: "Number of results to return",
          default: 5,
        },
      },
      required: ["query"],
    },
  },
];

export async function POST(req) {
  const { messages } = await req.json();

  // 1️⃣ First GPT call: ask it what it wants to do
  const firstResp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4-turbo",
      messages,
      functions: FUNCTIONS,
      function_call: "auto",
    }),
  });
  const firstJson = await firstResp.json();
  const choice = firstJson.choices?.[0]?.message;

  // 2️⃣ If GPT didn’t call our function, just return its response
  if (
    !choice?.function_call ||
    choice.function_call.name !== "search_products"
  ) {
    return NextResponse.json(firstJson, { status: firstResp.status });
  }

  // 3️⃣ Parse the function arguments
  let { query, k = 5 } = JSON.parse(choice.function_call.arguments || "{}");

  // 4️⃣ Get an embedding for the user’s query
  const embedResp = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: query,
    }),
  });
  const embedJson = await embedResp.json();
  const queryEmbedding = embedJson.data[0].embedding;

  // 5️⃣ Call your Supabase RPC to find nearest products
  const { data: matches, error: rpcError } = await supabase.rpc(
    "match_product_vectors",
    {
      query_embedding: queryEmbedding,
      match_count: k,
    }
  );
  if (rpcError) {
    console.error("RPC error:", rpcError);
    return NextResponse.json(
      { error: "Failed to run vector search" },
      { status: 500 }
    );
  }

  // 6️⃣ Fetch those product rows
  const ids = matches.map((m) => m.product_id);
  const { data: products, error: prodError } = await supabase
    .from("products")
    .select("id,name,brand,price,description,image_url,stock_quantity")
    .in("id", ids);
  if (prodError) {
    console.error("Fetch products error:", prodError);
    return NextResponse.json(
      { error: "Failed to load products" },
      { status: 500 }
    );
  }

  // 7️⃣ Let GPT craft a user-facing reply given the function result
  const secondResp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4-turbo",
      messages: [
        ...messages,
        choice, // the function call
        {
          role: "function",
          name: "search_products",
          content: JSON.stringify(products),
        },
      ],
    }),
  });
  const secondJson = await secondResp.json();
  return NextResponse.json(secondJson, { status: secondResp.status });
}
