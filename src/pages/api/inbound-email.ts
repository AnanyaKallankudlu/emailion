// pages/api/inbound-email.ts
import type { NextApiRequest, NextApiResponse } from "next";
require("dotenv").config();
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_KEY });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const currentDir = __dirname;
  console.log("Current directory:", currentDir);
  console.log(process.env.MY_VAR);
  console.log(process.env.NOTION_KEY);
  console.log(process.env.NOTION_DB_ID);
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const email = req.body;

  try {
    // Extract useful fields from Postmark payload
    const { From, SubjectText, EmailBody } = email;
    console.log("From:", From);
    console.log("Subject:", SubjectText);
    console.log("Content:", EmailBody);
    const result2 = await notion.databases.query({
      database_id: process.env.NOTION_DB_ID,
    });
    console.log(result2.results[0].properties);

    // Create a Notion page
    await notion.pages.create({
      parent: {
        database_id: process.env.NOTION_DB_ID,
      },
      properties: {
        Subject: {
          type: "title",
          id: "123",
          title: [{ text: { content: SubjectText } }],
        },
        "Recipient Email": {
          type: "email",
          id: "789",
          email: From,
        },
        Content: {
          type: "rich_text",
          id: "567",
          rich_text: [{ text: { content: EmailBody } }],
        },
      },
    });

    res.status(200).json({ message: "Email processed and sent to Notion" });
  } catch (error) {
    console.error("Error processing email:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
