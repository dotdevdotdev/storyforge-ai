import React, { useState } from "react";
import { Button } from "../ui";

export const StoryModal = ({ isOpen, onClose, story }) => {
  const [copyButtonText, setCopyButtonText] = useState("📋");
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);
  const [showDownloadTooltip, setShowDownloadTooltip] = useState(false);
  const [showTTSTooltip, setShowTTSTooltip] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [ttsButtonText, setTTSButtonText] = useState("🔊");
  const [currentAudio, setCurrentAudio] = useState(null);

  if (!isOpen || !story) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(story.content);
      setCopyButtonText("✓");
      setTimeout(() => {
        setCopyButtonText("📋");
      }, 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      setCopyButtonText("✗");
      setTimeout(() => {
        setCopyButtonText("📋");
      }, 2000);
    }
  };

  const handleDownload = () => {
    const timestamp = new Date(story.createdAt).toISOString().split("T")[0];
    const filename = `story-${timestamp}.md`;
    
    const blob = new Blob([story.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleTTS = async () => {
    // If audio is playing, stop it
    if (currentAudio && !currentAudio.paused) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
      setTTSButtonText("🔊");
      return;
    }

    try {
      setIsGeneratingAudio(true);
      setTTSButtonText("⏳");
      
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          text: story.content,
          storyId: story._id 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // If cached, show briefly with different icon
        if (data.cached) {
          setTTSButtonText("💾");
          setTimeout(() => {
            setTTSButtonText("⏹");
          }, 500);
        }
        
        // Create audio element and play
        const audio = new Audio(`data:${data.mimeType};base64,${data.audio}`);
        setCurrentAudio(audio);
        
        // Handle audio events
        audio.onplay = () => {
          setTTSButtonText("⏹");
        };
        
        audio.onended = () => {
          setTTSButtonText("🔊");
          setCurrentAudio(null);
        };
        
        audio.onerror = () => {
          setTTSButtonText("✗");
          setCurrentAudio(null);
          setTimeout(() => {
            setTTSButtonText("🔊");
          }, 2000);
        };
        
        // Play the audio
        await audio.play();
        
      } else {
        const error = await response.json();
        console.error("TTS failed:", error);
        setTTSButtonText("✗");
        setTimeout(() => {
          setTTSButtonText("🔊");
        }, 2000);
      }
    } catch (error) {
      console.error("TTS error:", error);
      setTTSButtonText("✗");
      setTimeout(() => {
        setTTSButtonText("🔊");
      }, 2000);
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  // Helper function to render metadata tags
  const renderMetadataTag = (label, value, color = "blue") => {
    const colorClasses = {
      blue: "bg-blue-100 text-blue-800 border-blue-200",
      green: "bg-green-100 text-green-800 border-green-200",
      purple: "bg-purple-100 text-purple-800 border-purple-200",
      yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
      pink: "bg-pink-100 text-pink-800 border-pink-200",
      indigo: "bg-indigo-100 text-indigo-800 border-indigo-200",
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${colorClasses[color]}`}>
        <span className="font-semibold mr-1">{label}:</span> {value}
      </span>
    );
  };

  // Extract metadata from story parameters
  const parameters = story.parameters || {};
  const genres = parameters.genres || [];
  const themes = parameters.themes || [];
  const characters = parameters.characters || [];
  const settings = parameters.settings || [];

  // Simple markdown parser for basic formatting
  const renderMarkdownContent = (content) => {
    if (!content) return null;
    
    // Split content into paragraphs
    const paragraphs = content.split(/\n\n+/);
    
    return paragraphs.map((paragraph, index) => {
      // Check if it's a header
      if (paragraph.startsWith('# ')) {
        return <h1 key={index} className="text-2xl font-bold text-gray-900 mb-4 mt-6">{paragraph.slice(2)}</h1>;
      } else if (paragraph.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-semibold text-gray-800 mb-3 mt-5">{paragraph.slice(3)}</h2>;
      } else if (paragraph.startsWith('### ')) {
        return <h3 key={index} className="text-lg font-semibold text-gray-800 mb-2 mt-4">{paragraph.slice(4)}</h3>;
      }
      
      // Check if it's a list
      if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
        const items = paragraph.split('\n').filter(line => line.trim());
        return (
          <ul key={index} className="list-disc list-inside mb-4 space-y-1">
            {items.map((item, i) => (
              <li key={i} className="text-gray-700">
                {parseInlineMarkdown(item.replace(/^[*-]\s+/, ''))}
              </li>
            ))}
          </ul>
        );
      }
      
      // Check if it's a blockquote
      if (paragraph.startsWith('>')) {
        return (
          <blockquote key={index} className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4">
            {parseInlineMarkdown(paragraph.replace(/^>\s*/gm, ''))}
          </blockquote>
        );
      }
      
      // Regular paragraph
      return (
        <p key={index} className="mb-4 text-gray-700 leading-relaxed">
          {parseInlineMarkdown(paragraph)}
        </p>
      );
    });
  };
  
  // Parse inline markdown (bold, italic, code)
  const parseInlineMarkdown = (text) => {
    // This is a simple implementation - for production, consider using a proper markdown parser
    let elements = [];
    let lastIndex = 0;
    
    // Simple regex for bold and italic
    const pattern = /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(`([^`]+)`)/g;
    let match;
    
    while ((match = pattern.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        elements.push(text.slice(lastIndex, match.index));
      }
      
      if (match[1]) {
        // Bold
        elements.push(<strong key={match.index} className="font-semibold text-gray-900">{match[2]}</strong>);
      } else if (match[3]) {
        // Italic
        elements.push(<em key={match.index} className="italic">{match[4]}</em>);
      } else if (match[5]) {
        // Code
        elements.push(<code key={match.index} className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">{match[6]}</code>);
      }
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      elements.push(text.slice(lastIndex));
    }
    
    return elements.length > 0 ? elements : text;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-backdrop">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-fade-in">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-gray-900">
                  {story.title || "Story"}
                </h2>
                
                {/* Action buttons with tooltips */}
                <div className="flex gap-2">
                  <div className="relative">
                    <button
                      className={`p-2 rounded-md transition-colors ${
                        copyButtonText === "✓" 
                          ? "bg-green-100 text-green-700" 
                          : "hover:bg-gray-200 text-gray-600"
                      }`}
                      onClick={handleCopy}
                      onMouseEnter={() => setShowCopyTooltip(true)}
                      onMouseLeave={() => setShowCopyTooltip(false)}
                    >
                      {copyButtonText}
                    </button>
                    {showCopyTooltip && (
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50">
                        Copy to Clipboard
                      </div>
                    )}
                  </div>
                  
                  <div className="relative">
                    <button
                      className="p-2 hover:bg-gray-200 rounded-md text-gray-600 transition-colors"
                      onClick={handleDownload}
                      onMouseEnter={() => setShowDownloadTooltip(true)}
                      onMouseLeave={() => setShowDownloadTooltip(false)}
                    >
                      ⬇
                    </button>
                    {showDownloadTooltip && (
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50">
                        Download as Markdown
                      </div>
                    )}
                  </div>
                  
                  <div className="relative">
                    <button
                      className={`p-2 rounded-md transition-colors ${
                        ttsButtonText === "✓" 
                          ? "bg-green-100 text-green-700" 
                          : ttsButtonText === "✗"
                          ? "bg-red-100 text-red-700"
                          : "hover:bg-gray-200 text-gray-600"
                      }`}
                      onClick={handleTTS}
                      disabled={isGeneratingAudio}
                      onMouseEnter={() => setShowTTSTooltip(true)}
                      onMouseLeave={() => setShowTTSTooltip(false)}
                    >
                      {ttsButtonText}
                    </button>
                    {showTTSTooltip && (
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50">
                        Read this Story
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Metadata section */}
              <div className="mt-3 space-y-2">
                <p className="text-sm text-gray-500">
                  Created on {new Date(story.createdAt).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                
                {/* User prompt if available */}
                {story.userPrompt && (
                  <div className="text-sm text-gray-600 italic bg-gray-100 p-2 rounded">
                    "{story.userPrompt}"
                  </div>
                )}
                
                {/* Parameter tags */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {parameters.name && renderMetadataTag("Parameters", parameters.name, "purple")}
                  {genres.length > 0 && genres.map((genre, i) => (
                    <span key={i} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                      {genre}
                    </span>
                  ))}
                  {themes.length > 0 && themes.map((theme, i) => (
                    <span key={i} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                      {theme}
                    </span>
                  ))}
                  {parameters.length && renderMetadataTag("Length", parameters.length, "yellow")}
                  {parameters.tone && renderMetadataTag("Tone", parameters.tone, "pink")}
                  {parameters.audience && renderMetadataTag("Audience", parameters.audience, "indigo")}
                </div>
                
                {/* Characters if available */}
                {characters.length > 0 && (
                  <div className="mt-2">
                    <span className="text-xs font-semibold text-gray-600 mr-2">Characters:</span>
                    {characters.map((char, i) => (
                      <span key={i} className="inline-flex items-center px-2 py-1 rounded text-xs bg-purple-100 text-purple-800 border border-purple-200 mr-1">
                        {char.name || char}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Settings if available */}
                {settings.length > 0 && (
                  <div className="mt-2">
                    <span className="text-xs font-semibold text-gray-600 mr-2">Settings:</span>
                    {settings.map((setting, i) => (
                      <span key={i} className="inline-flex items-center px-2 py-1 rounded text-xs bg-indigo-100 text-indigo-800 border border-indigo-200 mr-1">
                        {setting.name || setting}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <Button variant="ghost" onClick={onClose} className="ml-4">
              ✕
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="story-content prose max-w-none">
              {renderMarkdownContent(story.content)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};