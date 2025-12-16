'use server'

// 确保这里 import 的包名和你 package.json 里写的一致
import { importMarkdown } from '@shlllhub/notion-md-importer-core';

export type ImportState = {
  success: boolean;
  message: string;
  timestamp: number; // 加个时间戳强制 UI 更新
}

export async function handleImport(prevState: ImportState, formData: FormData): Promise<ImportState> {
  const apiKey = formData.get('apiKey') as string;
  const parentPageId = formData.get('parentPageId') as string;
  const title = formData.get('title') as string;
  const markdown = formData.get('markdown') as string;

  if (!apiKey || !parentPageId || !title || !markdown) {
    return { success: false, message: '请填写所有必填项', timestamp: Date.now() };
  }

  try {
    await importMarkdown({ apiKey, parentPageId, title, markdown });
    return { success: true, message: '导入 Notion 成功！', timestamp: Date.now() };
  } catch (error: any) {
    console.error(error);
    return { success: false, message: error.message || '导入失败', timestamp: Date.now() };
  }
}