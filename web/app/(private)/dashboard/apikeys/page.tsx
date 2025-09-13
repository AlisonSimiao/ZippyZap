'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sidebar } from '@/components/Sidebar'
import { 
  Key, 
  Copy, 
  Trash2, 
  Plus,
  Edit,
  Eye,
  EyeOff,
  Calendar,
  Activity
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState([
    { 
      id: 1, 
      name: 'Produção', 
      key: 'zapi_prod_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz', 
      created: '10/09/2025',
      lastUsed: '11/09/2025',
      usage24h: 247,
      status: 'active'
    },
    { 
      id: 2, 
      name: 'Desenvolvimento', 
      key: 'zapi_dev_xyz789abc123def456ghi789jkl012mno345pqr678stu901vw', 
      created: '08/09/2025',
      lastUsed: '10/09/2025',
      usage24h: 89,
      status: 'active'
    }
  ])
  const [showKeys, setShowKeys] = useState<{[key: number]: boolean}>({})
  const [newKeyName, setNewKeyName] = useState('')

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('API Key copiada!', { position: 'top-right' })
  }

  const toggleKeyVisibility = (id: number) => {
    setShowKeys(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const maskKey = (key: string) => {
    return key.substring(0, 12) + '...' + key.substring(key.length - 8)
  }

  const createApiKey = () => {
    if (!newKeyName) return
    const newKey = {
      id: Date.now(),
      name: newKeyName,
      key: `zapi_${newKeyName.toLowerCase()}_${Math.random().toString(36).substr(2, 45)}`,
      created: new Date().toLocaleDateString('pt-BR'),
      lastUsed: 'Nunca',
      usage24h: 0,
      status: 'active' as const
    }
    setApiKeys([...apiKeys, newKey])
    setNewKeyName('')
    toast.success('API Key criada com sucesso!', { position: 'top-right' })
  }

  const deleteApiKey = (id: number) => {
    setApiKeys(apiKeys.filter(key => key.id !== id))
    toast.success('API Key removida com sucesso!', { position: 'top-right' })
  }

  return (
    <>
      <Sidebar activeTab="apikeys" setActiveTab={() => {}} />
      
      <div className="flex-1 p-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">API Keys</h1>
              <p className="text-gray-600">Manage your project API keys. Remember to keep your API keys safe to prevent unauthorized access.</p>
            </div>
            <Button onClick={() => setNewKeyName('Nova API Key')} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create API Key
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Key className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total API Keys</p>
                    <p className="text-2xl font-bold">{apiKeys.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Activity className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">API Calls (24h)</p>
                    <p className="text-2xl font-bold">{apiKeys.reduce((sum, key) => sum + key.usage24h, 0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Active Keys</p>
                    <p className="text-2xl font-bold">{apiKeys.filter(key => key.status === 'active').length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Create API Key Form */}
          {newKeyName && (
            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader>
                <CardTitle>Criar Nova API Key</CardTitle>
                <CardDescription>Crie uma nova chave para suas integrações</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Input
                    placeholder="Nome da API Key"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={createApiKey} disabled={!newKeyName}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar
                  </Button>
                  <Button variant="outline" onClick={() => setNewKeyName('')}>
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* API Keys Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-4 font-medium text-gray-600">NAME</th>
                      <th className="text-left p-4 font-medium text-gray-600">SECRET KEY</th>
                      <th className="text-left p-4 font-medium text-gray-600">CREATED</th>
                      <th className="text-left p-4 font-medium text-gray-600">LAST USED</th>
                      <th className="text-left p-4 font-medium text-gray-600">USAGE (24HRS)</th>
                      <th className="text-right p-4 font-medium text-gray-600">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiKeys.map((apiKey) => (
                      <tr key={apiKey.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="font-medium">{apiKey.name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono">
                              {showKeys[apiKey.id] ? apiKey.key : maskKey(apiKey.key)}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleKeyVisibility(apiKey.id)}
                              className="h-8 w-8 p-0"
                            >
                              {showKeys[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(apiKey.key)}
                              className="h-8 w-8 p-0"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                        <td className="p-4 text-gray-600">{apiKey.created}</td>
                        <td className="p-4 text-gray-600">{apiKey.lastUsed}</td>
                        <td className="p-4">
                          <span className="text-sm font-medium">{apiKey.usage24h} API Calls</span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteApiKey(apiKey.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}