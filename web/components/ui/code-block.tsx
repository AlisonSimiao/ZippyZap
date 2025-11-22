"use client"

import React, { useState } from "react"
import { Highlight, themes, type Language } from "prism-react-renderer"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CodeBlockProps {
    code: string
    language: string
    className?: string
}

export function CodeBlock({ code, language, className }: CodeBlockProps) {
    const [isCopied, setIsCopied] = useState(false)

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(code)
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
    }

    return (
        <div className={`relative group rounded-lg overflow-hidden ${className}`}>
            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 bg-white/10 hover:bg-white/20 text-white"
                    onClick={copyToClipboard}
                >
                    {isCopied ? (
                        <Check className="h-4 w-4 text-green-400" />
                    ) : (
                        <Copy className="h-4 w-4" />
                    )}
                </Button>
            </div>
            <Highlight
                theme={themes.vsDark}
                code={code.trim()}
                language={language as Language}
            >
                {({ className, style, tokens, getLineProps, getTokenProps }) => (
                    <pre
                        className={`${className} p-4 overflow-auto text-sm bg-[#1e1e1e]`}
                        style={{
                            ...style,
                            backgroundColor: "#1e1e1e",
                            margin: 0,
                        }}
                    >
                        {tokens.map((line, i) => (
                            <div key={i} {...getLineProps({ line })}>
                                {line.map((token, key) => (
                                    <span key={key} {...getTokenProps({ token })} />
                                ))}
                            </div>
                        ))}
                    </pre>
                )}
            </Highlight>
        </div>
    )
}
