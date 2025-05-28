"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import ImageUploader from './components/ImageUploader';
import { supabase } from '@/lib/supabaseClient';
import { useUser } from '@supabase/auth-helpers-react'


export default function CrushScenarioForm() {
  const user = useUser() 
  const [scenario, setScenario] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter();

  const handleTextExtracted = (extractedText: string) => {
    setScenario(extractedText);
  };

  const handleFileChange = (newFile: File | null) => {
    setFile(newFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);

    const formData = new FormData();
    formData.append('scenario', scenario);
    if (file) {
      formData.append('file', file);
    }

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        if (user) {
          const { data: existing, error: fetchError } = await supabase
            .from('user_scenarios')
            .select('*')
            .eq('user_id', user.id)
            .single();
      
          if (fetchError) {
            console.error('Error fetching user data:', fetchError);
          }
      
          if (existing) {
            const { error: updateError } = await supabase
              .from('user_scenarios')
              .update({
                scenarios: [...existing.scenarios, scenario],
                results: [...existing.results, data.message],
                updated_at: new Date()
              })
              .eq('user_id', user.id);
      
            if (updateError) {
              console.error('Error updating scenario:', updateError);
            }
          } else {
            const { error: insertError } = await supabase
              .from('user_scenarios')
              .insert({
                user_id: user.id,
                scenarios: [scenario],
                results: [data.message]
              });
      
            if (insertError) {
              console.error('Error inserting scenario:', insertError);
            }
          }
        }
      
        router.push(`/features/delulu-analyzer/result?scenario=${encodeURIComponent(scenario)}&result=${encodeURIComponent(data.message)}`);
      }
       else {
        setResponse("Something went wrong. Try again.");
      }
    } catch (error) {
      console.error("Error analyzing scenario:", error);
      setResponse("Something went wrong. Try again.");
    }

    setLoading(false);
  };

  return (
    <Card className="max-w-md mx-auto mt-10 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl">Delulu or Not?</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="scenario">Your Crush Scenario</Label>
            <Textarea
              id="scenario"
              rows={4}
              placeholder="Type your crush scenario..."
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              className="resize-none"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Or Upload an Image with Text</Label>
            <ImageUploader 
              onTextExtracted={handleTextExtracted}
              onFileChange={handleFileChange}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Check Now"}
          </Button>
        </form>
        
        {response && <p className="mt-4 text-center text-gray-700">{response}</p>}
      </CardContent>
    </Card>
  );
}