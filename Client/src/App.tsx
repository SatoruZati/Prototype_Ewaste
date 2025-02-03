import { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import './App.css';

export default function App() {
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [description, setDescription] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const payload = { brand, model, description };
      const { data } = await axios.post('http://localhost:3000/api/chat', payload);
      setResponse(data.response);
    } catch (err) {
      setError('Failed to get response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center text-purple-400">
          Product Assessment Tool
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium">Brand</label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-purple-400 focus:border-transparent text-gray-100"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Model</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-purple-400 focus:border-transparent text-gray-100"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-purple-400 focus:border-transparent text-gray-100"
            />
          </div>

          <button
            type="submit"
            disabled={!brand || !model || !description || isLoading}
            className="w-full py-3 px-6 bg-purple-500 hover:bg-purple-600 rounded-lg font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : 'Analyze Product'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-900/80 rounded-lg">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {response && <ChatResponse response={response} />}
      </div>
    </div>
  );
}

function ChatResponse({ response }: { response: string }) {
  return (
    <div className="mt-8 p-6 bg-gray-800 rounded-lg border border-gray-700 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-purple-400">Analysis</h2>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        className="prose text-sm md:text-base text-gray-300"
      >
        {response}
      </ReactMarkdown>
    </div>
  );
}