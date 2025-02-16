import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { ArrowLeft, Code2, Users, Settings, Plus, Trash2, Edit, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { LANGUAGES, LEVEL_TIMES, Language } from '../types';

type Tab = 'snippets' | 'users' | 'settings';
type Difficulty = 'easy' | 'medium' | 'hard';

const AdminDashboard: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('snippets');
  const [expandedSnippet, setExpandedSnippet] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('typescript');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('easy');

  // Redirect if not admin
  if (!user || user.publicMetadata.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-3xl mb-4">Access Denied</h1>
        <p className="text-gray-400 mb-8">You don't have permission to access this page.</p>
        <button
          onClick={() => navigate('/')}
          className="text-[#EE342F] hover:text-[#D42D29] transition-colors"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const renderCodeSnippets = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl">Code Snippets</h2>
        <div className="flex items-center space-x-4">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value as Language)}
            className="bg-black/30 px-4 py-2 rounded-lg text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00FF94]"
          >
            {Object.entries(LANGUAGES).map(([key, name]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value as Difficulty)}
            className="bg-black/30 px-4 py-2 rounded-lg text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00FF94]"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-2 bg-[#00FF94] text-black rounded-lg hover:bg-[#00CC77] transition-colors">
            <Plus className="w-4 h-4" />
            <span>Add Snippet</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Example snippets - will be replaced with real data */}
        {[1, 2, 3].map((snippet) => (
          <div key={snippet} className="bg-black/30 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <div>
                <div className="flex items-center space-x-3">
                  <span className="text-[#00FF94] font-mono">{LANGUAGES[selectedLanguage]}</span>
                  <span className="text-gray-400">·</span>
                  <span className="text-gray-400">Volume 1</span>
                  <span className="text-gray-400">·</span>
                  <span className="text-gray-400">{selectedDifficulty}</span>
                  <span className="text-gray-400">·</span>
                  <span className={`text-sm ${snippet % 2 === 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {snippet % 2 === 0 ? 'Valid' : 'Invalid'}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-white transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button 
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  onClick={() => setExpandedSnippet(expandedSnippet === `snippet-${snippet}` ? null : `snippet-${snippet}`)}
                >
                  {expandedSnippet === `snippet-${snippet}` ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            {expandedSnippet === `snippet-${snippet}` && (
              <div className="border-t border-gray-800 p-4">
                <pre className="font-mono text-sm text-gray-300 whitespace-pre-wrap">
                  {`function example${snippet}() {\n  // Example code snippet\n  console.log("Hello, World!");\n}`}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderUsers = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl">Users</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search users..."
            className="bg-black/30 px-4 py-2 rounded-lg text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00FF94]"
          />
        </div>
      </div>

      <div className="bg-black/30 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left p-4 text-gray-400 font-medium">User</th>
              <th className="text-left p-4 text-gray-400 font-medium">Games</th>
              <th className="text-left p-4 text-gray-400 font-medium">Avg Score</th>
              <th className="text-left p-4 text-gray-400 font-medium">Role</th>
              <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Example users - will be replaced with real data */}
            {[1, 2, 3].map((user) => (
              <tr key={user} className="border-b border-gray-800 last:border-0">
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <div>
                      <div className="font-medium">User {user}</div>
                      <div className="text-sm text-gray-400">user{user}@example.com</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">{user * 10}</td>
                <td className="p-4">{8.5}</td>
                <td className="p-4">
                  <span className="text-sm bg-gray-800 text-gray-300 px-2 py-1 rounded">
                    {user === 1 ? 'Admin' : 'User'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-white transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div>
      <h2 className="text-xl mb-6">Settings</h2>
      
      <div className="space-y-6">
        <div className="bg-black/30 p-6 rounded-lg">
          <h3 className="text-lg mb-4">Game Configuration</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">Time Limits (seconds)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Easy</label>
                  <input
                    type="number"
                    className="bg-black/30 px-4 py-2 rounded-lg text-sm text-gray-300 w-full focus:outline-none focus:ring-2 focus:ring-[#00FF94]"
                    defaultValue={LEVEL_TIMES[1]}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Medium</label>
                  <input
                    type="number"
                    className="bg-black/30 px-4 py-2 rounded-lg text-sm text-gray-300 w-full focus:outline-none focus:ring-2 focus:ring-[#00FF94]"
                    defaultValue={LEVEL_TIMES[2]}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Hard</label>
                  <input
                    type="number"
                    className="bg-black/30 px-4 py-2 rounded-lg text-sm text-gray-300 w-full focus:outline-none focus:ring-2 focus:ring-[#00FF94]"
                    defaultValue={LEVEL_TIMES[3]}
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Snippets per Game
              </label>
              <input
                type="number"
                className="bg-black/30 px-4 py-2 rounded-lg text-sm text-gray-300 w-full focus:outline-none focus:ring-2 focus:ring-[#00FF94]"
                defaultValue={10}
              />
            </div>
          </div>
        </div>

        <div className="bg-black/30 p-6 rounded-lg">
          <h3 className="text-lg mb-4">Volume Management</h3>
          <div className="space-y-4">
            {Object.entries(LANGUAGES).map(([key, name]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="font-medium">{name}</span>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-400">Current Volume: 1</span>
                  <button className="px-4 py-2 bg-[#00FF94] text-black rounded-lg hover:bg-[#00CC77] transition-colors text-sm">
                    New Volume
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={() => navigate('/')}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-3xl">Admin Dashboard</h1>
      </div>

      <div className="flex space-x-1 mb-8 bg-black/30 p-1 rounded-lg max-w-fit">
        <button
          onClick={() => setActiveTab('snippets')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'snippets' ? 'bg-[#EE342F] text-black' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Snippets</span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'users' ? 'bg-[#EE342F] text-black' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Users</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'settings' ? 'bg-[#EE342F] text-black' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>

      <div className="bg-[#1A1A1A] p-6 rounded-lg">
        {activeTab === 'snippets' && renderCodeSnippets()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'settings' && renderSettings()}
      </div>
    </div>
  );
};

export default AdminDashboard;