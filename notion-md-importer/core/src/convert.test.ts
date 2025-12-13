/*
 * Copyright (c) 2025 shlll. All Rights Reserved
 *
 * @file convert.test.ts
 * @author shlll(shlll7347@gmail.com)
 * @date 2025/12/14 02:44:04
 * @brief
 */

import { test } from 'vitest';
import { importMarkdown } from "./index.js";

test("importMarkdown function", async () => {
  const PAGE_ID = process.env.NOTION_PAGE_ID || "";
  if (!PAGE_ID) throw new Error("Please set NOTION_PAGE_ID in .env");

  // 1. 准备一段测试 Markdown
  const markdown = `
    # Hello from Code
    This is a **bold** text.
    - List item 1
    - List item 2

    > This is a quote.
    `;

  await importMarkdown(markdown, PAGE_ID);
});
