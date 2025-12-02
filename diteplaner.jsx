import React, { useState } from 'react';
import { Apple, Flame, TrendingUp, Coffee, Sun, Moon, Cookie } from 'lucide-react';

export default function DietPlanner() {
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    weight: '',
    height: '',
    activityLevel: '',
    goal: '',
    dietType: '',
    cuisine: '',
    allergies: ''
  });
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculateTDEE = () => {
    const weight = parseFloat(formData.weight);
    const height = parseFloat(formData.height);
    const age = parseFloat(formData.age);
    
    // Mifflin-St Jeor Equation
    let bmr;
    if (formData.gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };

    return Math.round(bmr * activityMultipliers[formData.activityLevel]);
  };

  const generateDietPlan = async () => {
    if (!formData.age || !formData.gender || !formData.weight || !formData.height || 
        !formData.activityLevel || !formData.goal || !formData.dietType || !formData.cuisine) {
      alert('Please fill in all required fields!');
      return;
    }

    setLoading(true);

    const tdee = calculateTDEE();
    let targetCalories = tdee;
    
    if (formData.goal === 'weight_loss') targetCalories = tdee - 500;
    else if (formData.goal === 'muscle_gain') targetCalories = tdee + 300;

    const protein = Math.round(formData.weight * 2);
    const fat = Math.round((targetCalories * 0.25) / 9);
    const carbs = Math.round((targetCalories - (protein * 4) - (fat * 9)) / 4);

    const prompt = `You are a certified nutritionist. Create a 1-day meal plan:

User Profile:
- TDEE: ${tdee} kcal
- Goal: ${formData.goal}
- Target Calories: ${targetCalories} kcal/day
- Macros: ${protein}g protein, ${carbs}g carbs, ${fat}g fat
- Diet Type: ${formData.dietType}
- Cuisine Preference: ${formData.cuisine}
- Allergies: ${formData.allergies || 'None'}

Generate meals with simple recipes. Return ONLY valid JSON with no additional text:
{
  "target_calories": number,
  "macros": {"protein": number, "carbs": number, "fat": number},
  "meals": [
    {
      "meal_type": "Breakfast",
      "name": "string",
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number,
      "ingredients": ["string"],
      "recipe": "string"
    }
  ]
}

Include: Breakfast, Lunch, Dinner, and 2 Snacks`;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      const data = await response.json();
      const content = data.content[0].text;
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const dietData = JSON.parse(cleanContent);
      
      setMealPlan(dietData);
    } catch (error) {
      console.error('Error:', error);
      alert('Error generating diet plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getMealIcon = (mealType) => {
    if (mealType.includes('Breakfast')) return <Coffee className="text-orange-600" />;
    if (mealType.includes('Lunch')) return <Sun className="text-yellow-600" />;
    if (mealType.includes('Dinner')) return <Moon className="text-purple-600" />;
    return <Cookie className="text-pink-600" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 mt-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent mb-2">
            AI Diet Planner
          </h1>
          <p className="text-gray-600">Get a personalized meal plan based on your goals</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Apple className="text-green-600" />
            Your Profile
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Age *</label>
              <input
                type="number"
                placeholder="25"
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none"
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Gender *</label>
              <select
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none"
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Weight (kg) *</label>
              <input
                type="number"
                placeholder="70"
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none"
                value={formData.weight}
                onChange={(e) => setFormData({...formData, weight: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Height (cm) *</label>
              <input
                type="number"
                placeholder="175"
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none"
                value={formData.height}
                onChange={(e) => setFormData({...formData, height: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Activity Level *</label>
              <select
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none"
                value={formData.activityLevel}
                onChange={(e) => setFormData({...formData, activityLevel: e.target.value})}
              >
                <option value="">Select activity level</option>
                <option value="sedentary">Sedentary - Little/no exercise</option>
                <option value="light">Light - Exercise 1-3 days/week</option>
                <option value="moderate">Moderate - Exercise 3-5 days/week</option>
                <option value="active">Active - Exercise 6-7 days/week</option>
                <option value="very_active">Very Active - Hard exercise daily</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Goal *</label>
              <select
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none"
                value={formData.goal}
                onChange={(e) => setFormData({...formData, goal: e.target.value})}
              >
                <option value="">Select your goal</option>
                <option value="weight_loss">Weight Loss</option>
                <option value="maintenance">Maintain Weight</option>
                <option value="muscle_gain">Muscle Gain</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Diet Type *</label>
              <select
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none"
                value={formData.dietType}
                onChange={(e) => setFormData({...formData, dietType: e.target.value})}
              >
                <option value="">Select diet type</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="non-vegetarian">Non-Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="keto">Keto</option>
                <option value="pescatarian">Pescatarian</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Cuisine Preference *</label>
              <select
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none"
                value={formData.cuisine}
                onChange={(e) => setFormData({...formData, cuisine: e.target.value})}
              >
                <option value="">Select cuisine</option>
                <option value="indian">Indian</option>
                <option value="western">Western</option>
                <option value="mixed">Mixed (Indian + Western)</option>
                <option value="asian">Asian</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-semibold mb-2">Allergies or Restrictions (Optional)</label>
            <input
              type="text"
              placeholder="e.g., Nuts, Dairy, Gluten"
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none"
              value={formData.allergies}
              onChange={(e) => setFormData({...formData, allergies: e.target.value})}
            />
          </div>

          <button
            onClick={generateDietPlan}
            disabled={loading}
            className="w-full mt-6 bg-gradient-to-r from-green-600 to-teal-600 text-white py-4 rounded-lg font-bold text-lg hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                Generating Your Diet Plan...
              </>
            ) : (
              <>
                <Flame size={20} />
                Generate AI Diet Plan
              </>
            )}
          </button>
        </div>

        {mealPlan && (
          <div className="bg-white rounded-2xl shadow-xl p-8 animate-fadeIn">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Your Personalized Meal Plan</h2>
            <p className="text-gray-600 mb-6">Based on your goals and preferences</p>

            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <div className="bg-blue-50 p-4 rounded-xl">
                <div className="text-sm text-blue-600 font-semibold mb-1">Target Calories</div>
                <div className="text-2xl font-bold text-blue-700">{mealPlan.target_calories}</div>
              </div>
              <div className="bg-red-50 p-4 rounded-xl">
                <div className="text-sm text-red-600 font-semibold mb-1">Protein</div>
                <div className="text-2xl font-bold text-red-700">{mealPlan.macros.protein}g</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-xl">
                <div className="text-sm text-yellow-600 font-semibold mb-1">Carbs</div>
                <div className="text-2xl font-bold text-yellow-700">{mealPlan.macros.carbs}g</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-xl">
                <div className="text-sm text-orange-600 font-semibold mb-1">Fat</div>
                <div className="text-2xl font-bold text-orange-700">{mealPlan.macros.fat}g</div>
              </div>
            </div>

            <div className="space-y-6">
              {mealPlan.meals.map((meal, index) => (
                <div key={index} className="border-2 border-gray-100 rounded-xl p-6 hover:border-green-200 transition">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getMealIcon(meal.meal_type)}
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{meal.meal_type}</h3>
                        <p className="text-lg text-gray-700">{meal.name}</p>
                      </div>
                    </div>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                      {meal.calories} cal
                    </span>
                  </div>

                  <div className="flex gap-6 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500">Protein:</span>
                      <span className="font-bold ml-1 text-red-600">{meal.protein}g</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Carbs:</span>
                      <span className="font-bold ml-1 text-yellow-600">{meal.carbs}g</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Fat:</span>
                      <span className="font-bold ml-1 text-orange-600">{meal.fat}g</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <h4 className="font-semibold text-gray-700 mb-2">Ingredients:</h4>
                    <div className="flex flex-wrap gap-2">
                      {meal.ingredients.map((ingredient, i) => (
                        <span key={i} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                          {ingredient}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Recipe:</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">{meal.recipe}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={generateDietPlan}
              className="w-full mt-6 bg-gray-100 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              🔄 Generate New Plan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
