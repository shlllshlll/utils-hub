/*
 * Copyright (c) 2025 shlll. All Rights Reserved
 *
 * @file index.ts
 * @author shlll(shlll7347@gmail.com)
 * @date 2025/12/14 00:25:56
 * @brief
 */

import path from "path";
import { markdownToBlocks } from '@tryfabric/martian';
import { Client } from "@notionhq/client";

// 定义入参接口，让调用者看一眼就知道传什么
interface ImportOptions {
    apiKey: string;
    parentPageId: string; // 父页面 ID
    title: string;        // 新页面的标题（通常用文件名）
    markdown: string;     // Markdown 原始内容
}

// 辅助函数：将数组切成小块（处理 Notion 100 blocks 限制）
function chunkArray<T>(array: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
}

export async function importMarkdown(options: ImportOptions) {
    const { apiKey, parentPageId, title, markdown } = options;
    const notion = new Client({ auth: apiKey });

    console.log(`[Core] 正在解析 Markdown...`);
    // 1. 转换 Markdown -> Blocks
    const allBlocks = markdownToBlocks(markdown);

    // 2. 切片：Notion API 限制每次最多 100 个 block
    // 第一片(chunk)用于创建页面时直接带入，剩下的后续追加
    const batches = chunkArray(allBlocks, 100);
    const firstBatch = batches[0] || [];
    const restBatches = batches.slice(1);

    console.log(`[Core] 解析完成，共 ${allBlocks.length} 个 Block，分 ${batches.length} 批上传`);

    // 3. 创建新页面 (Page)
    // 注意：parent 参数指定了它挂在哪个页面下面
    console.log(`[Core] 正在创建页面: "${title}"...`);
    const newPage = await notion.pages.create({
        parent: { page_id: parentPageId },
        properties: {
            title: {
                title: [ // 设置页面标题
                    {
                        text: {
                            content: title,
                        },
                    },
                ],
            },
        },
        // 创建时直接带上第一批内容
        children: firstBatch as any,
    });

    const newPageId = newPage.id;
    console.log(`[Core] 页面创建成功 (ID: ${newPageId})，正在追加剩余内容...`);

    // 4. 追加剩余的 Block (如果有)
    for (let i = 0; i < restBatches.length; i++) {
        const batch = restBatches[i];
        console.log(`[Core] 正在上传第 ${i + 2}/${batches.length} 批...`);

        await notion.blocks.children.append({
            block_id: newPageId,
            children: batch as any,
        });
    }

    console.log(`[Core] 全部上传完成！`);
    return newPageId;
}
