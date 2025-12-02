import React, { useState } from 'react';
import { Dumbbell, Zap, Clock, TrendingUp } from 'lucide-react';

export default function WorkoutGenerator() {
  const [formData, setFormData] = useState({
    fitnessLevel: '',
    goal: '',
    equipment: '',
    duration: '',
    limitations: ''
  });
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateWorkout = async () => {
    if (!formData.fitnessLevel || !formData.goal || !formData.equipment || !formData.duration) {
      alert('Please fill in all required fields!');
      return;
    }

    setLoading(true);

    const prompt = `You are an expert personal trainer. Create a workout plan with these parameters:

User Profile:
- Fitness Level: ${formData.fitnessLevel}
- Goal: ${formData.goal}
- Available Equipment: ${formData.equipment}
- Time Available: ${formData.duration} minutes
- Injuries/Limitations: ${formData.limitations || 'None'}

Generate a workout with 5-7 exercises. Return ONLY valid JSON in this exact format with no additional text:
{
  "workout_name": "string",
  "duration": "string",
  "difficulty": "string",
  "exercises": [
    {
      "name": "string",
      "sets": number,
      "reps": "string",
      "rest_seconds": number,
      "form_cue": "string"
    }
  ],
  "estimated_calories": number
}`;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      const data = await response.json();
      const content = data.content[0].text;
      
      // Clean the response - remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const workoutData = JSON.parse(cleanContent);
      
      setWorkout(workoutData);
    } catch (error) {
      console.error('Error:', error);
      alert('Error generating workout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 mt-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            AI Workout Generator
          </h1>
          <p className="text-gray-600">Get a personalized workout plan in seconds</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Dumbbell className="text-purple-600" />
            Tell Us About You
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Fitness Level *</label>
              <select
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-600 focus:outline-none"
                value={formData.fitnessLevel}
                onChange={(e) => setFormData({...formData, fitnessLevel: e.target.value})}
              >
                <option value="">Select your level</option>
                <option value="beginner">Beginner - New to fitness</option>
                <option value="intermediate">Intermediate - 6+ months experience</option>
                <option value="advanced">Advanced - 2+ years experience</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Fitness Goal *</label>
              <select
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-600 focus:outline-none"
                value={formData.goal}
                onChange={(e) => setFormData({...formData, goal: e.target.value})}
              >
                <option value="">Select your goal</option>
                <option value="weight_loss">Weight Loss / Fat Burn</option>
                <option value="muscle_gain">Muscle Gain / Hypertrophy</option>
                <option value="strength">Strength Building</option>
                <option value="endurance">Endurance / Cardio</option>
                <option value="general_fitness">General Fitness</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Available Equipment *</label>
              <select
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-600 focus:outline-none"
                value={formData.equipment}
                onChange={(e) => setFormData({...formData, equipment: e.target.value})}
              >
                <option value="">Select equipment</option>
                <option value="bodyweight">Bodyweight Only</option>
                <option value="dumbbells">Dumbbells</option>
                <option value="resistance_bands">Resistance Bands</option>
                <option value="full_gym">Full Gym Access</option>
                <option value="home_gym">Home Gym (Dumbbells + Bench)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Workout Duration *</label>
              <select
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-600 focus:outline-none"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
              >
                <option value="">Select duration</option>
                <option value="15">15 minutes - Quick session</option>
                <option value="30">30 minutes - Standard</option>
                <option value="45">45 minutes - Extended</option>
                <option value="60">60 minutes - Full workout</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Injuries or Limitations (Optional)</label>
              <input
                type="text"
                placeholder="e.g., Bad knee, lower back pain, shoulder injury"
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-600 focus:outline-none"
                value={formData.limitations}
                onChange={(e) => setFormData({...formData, limitations: e.target.value})}
              />
            </div>
          </div>

          <button
            onClick={generateWorkout}
            disabled={loading}
            className="w-full mt-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                Generating Your Workout...
              </>
            ) : (
              <>
                <Zap size={20} />
                Generate AI Workout
              </>
            )}
          </button>
        </div>

        {workout && (
          <div className="bg-white rounded-2xl shadow-xl p-8 animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-800">{workout.workout_name}</h2>
              <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full font-semibold">
                {workout.difficulty}
              </span>
            </div>

            <div className="flex gap-4 mb-6">
              <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
                <Clock size={18} className="text-blue-600" />
                <span className="font-semibold">{workout.duration}</span>
              </div>
              <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-lg">
                <TrendingUp size={18} className="text-orange-600" />
                <span className="font-semibold">~{workout.estimated_calories} cal</span>
              </div>
            </div>

            <div className="space-y-4">
              {workout.exercises.map((exercise, index) => (
                <div key={index} className="border-2 border-gray-100 rounded-xl p-6 hover:border-purple-200 transition">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-1">{exercise.name}</h3>
                      <p className="text-sm text-gray-600">{exercise.form_cue}</p>
                    </div>
                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
                      Exercise {index + 1}
                    </span>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <div>
                      <span className="text-gray-500">Sets:</span>
                      <span className="font-bold ml-2">{exercise.sets}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Reps:</span>
                      <span className="font-bold ml-2">{exercise.reps}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Rest:</span>
                      <span className="font-bold ml-2">{exercise.rest_seconds}s</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={generateWorkout}
              className="w-full mt-6 bg-gray-100 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              🔄 Generate New Workout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}