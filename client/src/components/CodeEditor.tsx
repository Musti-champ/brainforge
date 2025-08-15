import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CodeEditorProps {
  language: string;
  code: string;
  readOnly?: boolean;
  onChange?: (code: string) => void;
}

export default function CodeEditor({ language, code, readOnly = false, onChange }: CodeEditorProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 capitalize">{language}</span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleCopy}
          data-testid="copy-code"
        >
          {copied ? (
            <Check className="h-4 w-4 mr-1 text-green-600" />
          ) : (
            <Copy className="h-4 w-4 mr-1" />
          )}
          {copied ? "Copied!" : "Copy"}
        </Button>
      </div>
      
      <div className="p-4 bg-gray-900 text-gray-100 font-mono text-sm rounded-b-lg overflow-x-auto">
        {readOnly ? (
          <pre className="whitespace-pre-wrap" data-testid="code-display">
            <code>{code}</code>
          </pre>
        ) : (
          <textarea
            value={code}
            onChange={(e) => onChange?.(e.target.value)}
            className="w-full bg-transparent text-gray-100 font-mono resize-none outline-none min-h-[200px]"
            data-testid="code-editor"
            spellCheck={false}
          />
        )}
      </div>
    </div>
  );
}
