'use client'

import React, { useEffect, useState } from 'react'
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
import { api } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { IApikey } from '@/types/apikey'
import { format } from 'date-fns'
import { CreateApiKeyModal } from '@/components/modals/CreateApiKeyModal'

export default function ApiKeysPage() {
  const { accessToken } = useAuth()
  const [apiKeys, setApiKeys] = useState<IApikey[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    api.getApiKeys(accessToken)
    .then(data => {
      setApiKeys(data)
    })
    .catch(error => {
      console.error('Error fetching API keys:', error)
    })
  }, [])

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
            <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
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
                    <p className="text-2xl font-bold">{0 /** uso no dia */}</p>
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
                    <p className="text-2xl font-bold">{apiKeys.filter(key => key.status === 'ACTIVE').length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

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
                              {'*'.repeat(20)}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {}}
                              className="h-8 w-8 p-0"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                        <td className="p-4 text-gray-600">{format(new Date(apiKey.createdAt), 'dd-MM-yyyy HH:mm:ss')}</td>
                        <td className="p-4 text-gray-600">{format(new Date(apiKey.createdAt), 'dd-MM-yyyy HH:mm:ss')}</td>
                        <td className="p-4">
                          <span className="text-sm font-medium">{0} API Calls</span>
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
                              onClick={() => apiKey.id}
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
      
      <CreateApiKeyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          api.getApiKeys(accessToken)
            .then(data => setApiKeys(data))
            .catch(error => console.error('Error fetching API keys:', error))
        }}
        accessToken={accessToken}
      />
    </>
  )
}