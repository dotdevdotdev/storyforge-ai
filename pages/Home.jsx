import React from "react";
import { Button, Card } from "../components/ui";
import Link from "next/link";

const Home = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Welcome to your next adventure!
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          StoryForge AI is a platform that allows you to create your own stories
          and images using AI.
        </p>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-12">
          <Link href="/stories">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Stories</h3>
              <p className="text-gray-600">Create and manage your AI-generated stories</p>
            </Card>
          </Link>
          
          <Link href="/characters">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Characters</h3>
              <p className="text-gray-600">Build your cast of characters</p>
            </Card>
          </Link>
          
          <Link href="/locations">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Locations</h3>
              <p className="text-gray-600">Design worlds and settings</p>
            </Card>
          </Link>
          
          <Link href="/themes">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Themes</h3>
              <p className="text-gray-600">Define narrative themes</p>
            </Card>
          </Link>
        </div>
        
        <div className="mt-12">
          <Link href="/stories">
            <Button variant="primary" size="lg">
              Start Creating Stories
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
