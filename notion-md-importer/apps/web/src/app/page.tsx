'use client'

// 1. 问题修复: 使用 useActionState (React 19)
import { useState, useEffect, useActionState } from 'react'
import { useDropzone } from 'react-dropzone'
import { handleImport } from './actions'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from "sonner"

export default function Home() {
  // --- 状态管理 ---
  const [markdown, setMarkdown] = useState('')
  const [title, setTitle] = useState('')

  // 3. 持久化存储: API Key 和 Page ID
  const [apiKey, setApiKey] = useState('')
  const [parentPageId, setParentPageId] = useState('')

  // 初始化加载 LocalStorage
  useEffect(() => {
    const storedApiKey = localStorage.getItem('notion_api_key')
    const storedPageId = localStorage.getItem('notion_page_id')
    if (storedApiKey) setApiKey(storedApiKey)
    if (storedPageId) setParentPageId(storedPageId)
  }, [])

  // 处理输入变化并保存到 LocalStorage
  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setApiKey(val)
    localStorage.setItem('notion_api_key', val)
  }

  const handlePageIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setParentPageId(val)
    localStorage.setItem('notion_page_id', val)
  }

  // --- Server Action 绑定 ---
  // isPending 直接用于控制按钮 loading 状态
  const [state, formAction, isPending] = useActionState(handleImport, {
    success: false,
    message: '',
    timestamp: 0
  })

  // 监听结果
  useEffect(() => {
    if (state.timestamp === 0) return;

    if (state.success) {
      toast.success(state.message);
    } else {
      toast.error(state.message);
    }
  }, [state])

  // --- 拖拽逻辑 ---
  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      if (!title) {
        const fileName = file.name.replace(/\.md$/i, '')
        setTitle(fileName)
      }
      const reader = new FileReader()
      reader.onload = () => {
        const content = reader.result as string;
        setMarkdown(content)
        toast.info(`已加载文件: ${file.name}`)
      }
      reader.readAsText(file)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/markdown': ['.md'] },
    maxFiles: 1
  })

  return (
    // 背景色适配深色模式：dark:bg-slate-950
    <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors duration-300">

      <Card className="w-full max-w-6xl shadow-lg bg-white dark:bg-slate-900 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-2xl">Notion Markdown Importer</CardTitle>
          <CardDescription>配置参数并将 Markdown 导入 Notion</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-6">

            {/* 第一行：Key 和 ID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="apiKey">Notion API Key</Label>
                <Input
                  id="apiKey"
                  name="apiKey"
                  type="password"
                  placeholder="secret_..."
                  required
                  // 绑定状态
                  value={apiKey}
                  onChange={handleApiKeyChange}
                />
                <p className="text-[0.8rem] text-slate-500 dark:text-slate-400">
                  会自动保存到本地浏览器
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentPageId">Parent Page ID</Label>
                <Input
                  id="parentPageId"
                  name="parentPageId"
                  placeholder="32位 ID"
                  required
                  // 绑定状态
                  value={parentPageId}
                  onChange={handlePageIdChange}
                />
              </div>
            </div>

            {/* 第二行：标题 */}
            <div className="space-y-2">
              <Label htmlFor="title">页面标题</Label>
              <Input
                id="title"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="新页面标题 (留空则读取文件名)"
              />
            </div>

            {/* 第三行：拖拽与输入 */}
            <div className="space-y-2">
              <Label>Markdown 内容</Label>

              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-md p-8 text-center cursor-pointer transition-all duration-200
                  ${isDragActive
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-600'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-500'
                  }`}
              >
                <input {...getInputProps()} />
                {isDragActive ? (
                  <p>释放以上传文件</p>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-base font-medium">拖拽 .md 文件到此处</p>
                    <p className="text-xs text-slate-400">或者点击选择文件</p>
                  </div>
                )}
              </div>

              <Textarea
                name="markdown"
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                placeholder="# Paste markdown here..."
                // 高度调大一点
                className="min-h-[300px] font-mono text-sm leading-relaxed dark:bg-slate-950 dark:border-slate-800"
                required
              />
            </div>

            {/* 底部按钮 */}
            <div className="pt-4">
              <Button type="submit" size="lg" className="w-full text-base" disabled={isPending}>
                {isPending ? '正在导入中...' : '开始导入到 Notion'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}