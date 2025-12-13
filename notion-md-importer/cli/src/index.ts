#!/usr/bin/env node
/*
 * Copyright (c) 2025 shlll. All Rights Reserved
 *
 * @file index.ts
 * @author shlll(shlll7347@gmail.com)
 * @date 2025/12/14 01:12:32
 * @brief
 */

import { Command } from "commander";
import fs from "fs";
import path from "path";
import { importMarkdown } from "@notion-md-importer/core";
import dotenv from "dotenv";

dotenv.config();
const API_KEY = process.env.NOTION_API_KEY;
if (!API_KEY) {
    throw new Error("请在 .env 文件中设置 NOTION_API_KEY");
}
const program = new Command();

program
    .name("Notion Markdown Importer")
    .description("Import local Markdown files to Notion")
    .version("1.0.0");

program
    .command("import")
    .argument("<filePath>", "markdown file path")
    .requiredOption("-p, --page <pageId>", "Parent Page ID in Notion")
    .action(async (filePath: string, options: { page: string }) => {
        try {
            const absolutePath = path.resolve(process.cwd(), filePath);

            if (!fs.existsSync(absolutePath)) {
                throw new Error(`文件不存在: ${absolutePath}`);
            }

            // 1. 读取文件内容
            const content = fs.readFileSync(absolutePath, "utf-8");

            // 2. 获取文件名作为标题 (比如 "MyNote.md" -> "MyNote")
            const fileName = path.basename(absolutePath, path.extname(absolutePath));

            // 3. 调用 Core 逻辑
            await importMarkdown({
                apiKey: process.env.NOTION_API_KEY || "",
                parentPageId: options.page,
                title: fileName, // 传入标题
                markdown: content
            });

            console.log("✅ 导入成功！");

        } catch (error) {
            console.error("❌ 失败:", error);
        }
    });

program.parse();
