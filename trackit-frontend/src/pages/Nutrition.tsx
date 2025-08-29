import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Chip,
  Stack,
  LinearProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Person,
  Restaurant,
  ExpandMore,
  CheckCircle,
  LocalDining,
  Analytics,
  Delete,
  History,
  TrendingUp,
  CalendarToday,
} from '@mui/icons-material';

interface UserProfile {
  age: number;
  gender: 'male' | 'female';
  height: number;
  weight: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal: 'lose_weight' | 'maintain' | 'gain_weight' | 'muscle_gain';
  dietType: 'omnivore' | 'vegetarian' | 'vegan' | 'keto' | 'paleo';
  allergies: string[];
  medicalConditions: string[];
  mealsPerDay: number;
  targetCalories?: number;
  macros?: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

interface MealPlan {
  id: string;
  date: string;
  meals: Meal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  savedAt?: string;
  profileSnapshot?: UserProfile;
}

interface Meal {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  ingredients: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  instructions: string;
  prepTime: number;
}

const steps = ['Personal Info', 'Health & Goals', 'Preferences', 'Generate Plan'];

const activityLevels = [
  { value: 'sedentary', label: 'Sedentary (desk job, no exercise)' },
  { value: 'light', label: 'Light (light exercise 1-3 days/week)' },
  { value: 'moderate', label: 'Moderate (moderate exercise 3-5 days/week)' },
  { value: 'active', label: 'Active (hard exercise 6-7 days/week)' },
  { value: 'very_active', label: 'Very Active (physical job + exercise)' },
];

const goals = [
  { value: 'lose_weight', label: 'Lose Weight', description: 'Create calorie deficit' },
  { value: 'maintain', label: 'Maintain Weight', description: 'Maintain current weight' },
  { value: 'gain_weight', label: 'Gain Weight', description: 'Healthy weight gain' },
  { value: 'muscle_gain', label: 'Build Muscle', description: 'Gain muscle mass' },
];

const dietTypes = [
  { value: 'omnivore', label: 'Omnivore', description: 'All foods' },
  { value: 'vegetarian', label: 'Vegetarian', description: 'No meat' },
  { value: 'vegan', label: 'Vegan', description: 'No animal products' },
  { value: 'keto', label: 'Ketogenic', description: 'Low carb, high fat' },
  { value: 'paleo', label: 'Paleo', description: 'Whole foods only' },
];

export default function Nutrition() {
  const [activeStep, setActiveStep] = useState(0);
  const [currentTab, setCurrentTab] = useState(1); // Start with Diet Plan tab
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    age: 25,
    gender: 'male',
    height: 170,
    weight: 70,
    activityLevel: 'moderate',
    goal: 'maintain',
    dietType: 'omnivore',
    allergies: [],
    medicalConditions: [],
    mealsPerDay: 3,
  });
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(() => {
    try {
      const saved = localStorage.getItem('currentMealPlan');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Error loading current meal plan from localStorage:', error);
      return null;
    }
  });
  const [savedPlans, setSavedPlans] = useState<MealPlan[]>(() => {
    try {
      const saved = localStorage.getItem('savedMealPlans');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading saved meal plans from localStorage:', error);
      return [];
    }
  });
  const [savingPlan, setSavingPlan] = useState(false);

  // Save to localStorage whenever mealPlan changes
  useEffect(() => {
    try {
      if (mealPlan) {
        localStorage.setItem('currentMealPlan', JSON.stringify(mealPlan));
      } else {
        localStorage.removeItem('currentMealPlan');
      }
    } catch (error) {
      console.error('Error saving current meal plan to localStorage:', error);
    }
  }, [mealPlan]);

  // Save to localStorage whenever savedPlans changes
  useEffect(() => {
    try {
      localStorage.setItem('savedMealPlans', JSON.stringify(savedPlans));
    } catch (error) {
      console.error('Error saving meal plans to localStorage:', error);
    }
  }, [savedPlans]);

  // Calculate BMR and daily calories
  const calculateBMR = (profile: UserProfile) => {
    const { age, gender, height, weight } = profile;
    if (gender === 'male') {
      return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
  };

  const calculateTDEE = (bmr: number, activityLevel: string) => {
    const multipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };
    return bmr * multipliers[activityLevel as keyof typeof multipliers];
  };

  const calculateTargetCalories = (tdee: number, goal: string) => {
    switch (goal) {
      case 'lose_weight': return Math.round(tdee - 500);
      case 'gain_weight': return Math.round(tdee + 500);
      case 'muscle_gain': return Math.round(tdee + 300);
      default: return Math.round(tdee);
    }
  };

  const calculateMacros = (calories: number, goal: string) => {
    switch (goal) {
      case 'muscle_gain':
        return {
          protein: Math.round(calories * 0.3 / 4),
          carbs: Math.round(calories * 0.4 / 4),
          fat: Math.round(calories * 0.3 / 9),
        };
      case 'lose_weight':
        return {
          protein: Math.round(calories * 0.35 / 4),
          carbs: Math.round(calories * 0.35 / 4),
          fat: Math.round(calories * 0.3 / 9),
        };
      default:
        return {
          protein: Math.round(calories * 0.25 / 4),
          carbs: Math.round(calories * 0.45 / 4),
          fat: Math.round(calories * 0.3 / 9),
        };
    }
  };

  useEffect(() => {
    const bmr = calculateBMR(profile);
    const tdee = calculateTDEE(bmr, profile.activityLevel);
    const targetCalories = calculateTargetCalories(tdee, profile.goal);
    const macros = calculateMacros(targetCalories, profile.goal);
    
    setProfile(prev => ({ ...prev, targetCalories, macros }));
  }, [profile.age, profile.gender, profile.height, profile.weight, profile.activityLevel, profile.goal]);

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      generateMealPlan();
    } else {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };


  const savePlan = async () => {
    if (!mealPlan) return;
    
    setSavingPlan(true);
    try {
      // Simulate API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const planToSave = {
        ...mealPlan,
        savedAt: new Date().toISOString(),
        profileSnapshot: { ...profile }
      };
      
      setSavedPlans(prev => {
        const updatedPlans = [planToSave, ...prev];
        // localStorage will be updated automatically via useEffect
        return updatedPlans;
      });
      
      // Show success message and switch to analytics tab
      setCurrentTab(2);
    } catch (error) {
      console.error('Failed to save meal plan:', error);
    } finally {
      setSavingPlan(false);
    }
  };

  const deleteSavedPlan = (planId: string) => {
    setSavedPlans(prev => {
      const updatedPlans = prev.filter(plan => plan.id !== planId);
      // localStorage will be updated automatically via useEffect
      return updatedPlans;
    });
  };

  const loadSavedPlan = (plan: MealPlan) => {
    setMealPlan(plan);
    setCurrentTab(1);
  };

  // Meal database based on diet types
  const getMealsByDietType = (dietType: string) => {
    const mealDatabase = {
      omnivore: {
        breakfast: [
          {
            name: 'Protein Oatmeal Bowl',
            ingredients: ['Oats (50g)', 'Protein powder (30g)', 'Banana (1 medium)', 'Almonds (15g)', 'Honey (1 tbsp)'],
            calories: 420, protein: 25, carbs: 45, fat: 12,
            instructions: '1. Cook oats with water. 2. Mix in protein powder. 3. Top with sliced banana and almonds. 4. Drizzle with honey.',
            prepTime: 10
          },
          {
            name: 'Scrambled Eggs with Toast',
            ingredients: ['Eggs (2 large)', 'Whole wheat bread (2 slices)', 'Butter (1 tsp)', 'Spinach (50g)', 'Cheese (30g)'],
            calories: 380, protein: 22, carbs: 28, fat: 18,
            instructions: '1. Scramble eggs with spinach. 2. Toast bread. 3. Add cheese and serve.',
            prepTime: 8
          }
        ],
        lunch: [
          {
            name: 'Grilled Chicken Salad',
            ingredients: ['Chicken breast (150g)', 'Mixed greens (100g)', 'Cherry tomatoes (100g)', 'Cucumber (50g)', 'Olive oil (1 tbsp)', 'Lemon juice'],
            calories: 380, protein: 35, carbs: 12, fat: 18,
            instructions: '1. Grill chicken breast. 2. Mix greens, tomatoes, cucumber. 3. Top with sliced chicken. 4. Dress with olive oil and lemon.',
            prepTime: 20
          },
          {
            name: 'Turkey Wrap',
            ingredients: ['Turkey breast (120g)', 'Whole wheat tortilla (1 large)', 'Avocado (1/2)', 'Lettuce', 'Tomato', 'Hummus (2 tbsp)'],
            calories: 420, protein: 28, carbs: 35, fat: 16,
            instructions: '1. Spread hummus on tortilla. 2. Add turkey, avocado, lettuce, tomato. 3. Roll tightly.',
            prepTime: 5
          }
        ],
        dinner: [
          {
            name: 'Salmon with Quinoa',
            ingredients: ['Salmon fillet (150g)', 'Quinoa (60g dry)', 'Broccoli (150g)', 'Olive oil (1 tbsp)', 'Herbs & spices'],
            calories: 520, protein: 40, carbs: 35, fat: 22,
            instructions: '1. Cook quinoa. 2. Bake salmon with herbs. 3. Steam broccoli. 4. Serve together with olive oil drizzle.',
            prepTime: 25
          },
          {
            name: 'Beef Stir Fry',
            ingredients: ['Lean beef (120g)', 'Brown rice (60g dry)', 'Mixed vegetables (200g)', 'Soy sauce', 'Garlic', 'Ginger'],
            calories: 480, protein: 32, carbs: 45, fat: 14,
            instructions: '1. Cook rice. 2. Stir fry beef with vegetables. 3. Season with soy sauce, garlic, ginger.',
            prepTime: 20
          }
        ]
      },
      vegetarian: {
        breakfast: [
          {
            name: 'Vegetarian Protein Smoothie',
            ingredients: ['Plant protein powder (30g)', 'Banana (1 medium)', 'Spinach (50g)', 'Almond milk (250ml)', 'Chia seeds (1 tbsp)', 'Berries (100g)'],
            calories: 380, protein: 28, carbs: 42, fat: 8,
            instructions: '1. Blend all ingredients until smooth. 2. Add ice if desired. 3. Serve immediately.',
            prepTime: 5
          },
          {
            name: 'Avocado Toast with Hemp Seeds',
            ingredients: ['Whole grain bread (2 slices)', 'Avocado (1 large)', 'Hemp seeds (2 tbsp)', 'Tomato (1 medium)', 'Lemon juice', 'Salt & pepper'],
            calories: 420, protein: 15, carbs: 35, fat: 28,
            instructions: '1. Toast bread. 2. Mash avocado with lemon juice. 3. Spread on toast, top with tomato and hemp seeds.',
            prepTime: 8
          }
        ],
        lunch: [
          {
            name: 'Quinoa Buddha Bowl',
            ingredients: ['Quinoa (80g dry)', 'Chickpeas (150g)', 'Sweet potato (150g)', 'Kale (100g)', 'Tahini (2 tbsp)', 'Pumpkin seeds (15g)'],
            calories: 480, protein: 20, carbs: 65, fat: 16,
            instructions: '1. Cook quinoa and roast sweet potato. 2. Massage kale with tahini. 3. Assemble bowl with all ingredients.',
            prepTime: 25
          },
          {
            name: 'Lentil Vegetable Soup',
            ingredients: ['Red lentils (100g)', 'Mixed vegetables (200g)', 'Vegetable broth (300ml)', 'Coconut milk (100ml)', 'Turmeric', 'Cumin'],
            calories: 350, protein: 18, carbs: 45, fat: 8,
            instructions: '1. Cook lentils with vegetables in broth. 2. Add coconut milk and spices. 3. Simmer until tender.',
            prepTime: 30
          }
        ],
        dinner: [
          {
            name: 'Stuffed Bell Peppers',
            ingredients: ['Bell peppers (2 large)', 'Brown rice (60g dry)', 'Black beans (150g)', 'Corn (100g)', 'Cheese (50g)', 'Herbs'],
            calories: 450, protein: 22, carbs: 58, fat: 12,
            instructions: '1. Cook rice and mix with beans, corn. 2. Stuff peppers with mixture. 3. Top with cheese and bake.',
            prepTime: 35
          },
          {
            name: 'Tofu Curry with Rice',
            ingredients: ['Firm tofu (150g)', 'Basmati rice (60g dry)', 'Coconut milk (200ml)', 'Curry spices', 'Vegetables (200g)', 'Cilantro'],
            calories: 520, protein: 25, carbs: 55, fat: 22,
            instructions: '1. Cook rice. 2. Pan-fry tofu until golden. 3. Make curry with coconut milk and spices. 4. Serve over rice.',
            prepTime: 25
          }
        ]
      },
      vegan: {
        breakfast: [
          {
            name: 'Chia Pudding Bowl',
            ingredients: ['Chia seeds (30g)', 'Oat milk (250ml)', 'Maple syrup (1 tbsp)', 'Berries (100g)', 'Nuts (20g)', 'Coconut flakes'],
            calories: 380, protein: 12, carbs: 45, fat: 18,
            instructions: '1. Mix chia seeds with oat milk and maple syrup. 2. Refrigerate overnight. 3. Top with berries and nuts.',
            prepTime: 5
          }
        ],
        lunch: [
          {
            name: 'Hummus Veggie Wrap',
            ingredients: ['Whole wheat tortilla (1 large)', 'Hummus (60g)', 'Cucumber', 'Carrots', 'Sprouts', 'Avocado (1/2)', 'Spinach'],
            calories: 350, protein: 15, carbs: 45, fat: 14,
            instructions: '1. Spread hummus on tortilla. 2. Add all vegetables. 3. Roll tightly and slice.',
            prepTime: 8
          }
        ],
        dinner: [
          {
            name: 'Lentil Bolognese with Pasta',
            ingredients: ['Whole wheat pasta (80g)', 'Red lentils (100g)', 'Tomato sauce (200ml)', 'Vegetables (150g)', 'Nutritional yeast (2 tbsp)', 'Herbs'],
            calories: 480, protein: 22, carbs: 75, fat: 8,
            instructions: '1. Cook pasta. 2. Make lentil bolognese with tomatoes and vegetables. 3. Serve with nutritional yeast.',
            prepTime: 25
          }
        ]
      }
    };

    return mealDatabase[dietType as keyof typeof mealDatabase] || mealDatabase.omnivore;
  };

  const generateMealPlan = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const meals = getMealsByDietType(profile.dietType);
      
      // Randomly select meals for variety
      const selectedMeals: Meal[] = [];
      let mealId = 1;
      
      // Select breakfast
      const breakfast = meals.breakfast[Math.floor(Math.random() * meals.breakfast.length)];
      selectedMeals.push({ ...breakfast, id: (mealId++).toString(), type: 'breakfast' });
      
      // Select lunch
      const lunch = meals.lunch[Math.floor(Math.random() * meals.lunch.length)];
      selectedMeals.push({ ...lunch, id: (mealId++).toString(), type: 'lunch' });
      
      // Select dinner
      const dinner = meals.dinner[Math.floor(Math.random() * meals.dinner.length)];
      selectedMeals.push({ ...dinner, id: (mealId++).toString(), type: 'dinner' });
      
      // Add snacks if meals per day > 3
      if (profile.mealsPerDay > 3) {
        const snackOptions = {
          omnivore: { name: 'Greek Yogurt with Nuts', ingredients: ['Greek yogurt (150g)', 'Mixed nuts (20g)', 'Honey (1 tsp)'], calories: 220, protein: 15, carbs: 12, fat: 12, instructions: 'Mix yogurt with nuts and honey.', prepTime: 2 },
          vegetarian: { name: 'Apple with Almond Butter', ingredients: ['Apple (1 medium)', 'Almond butter (2 tbsp)', 'Cinnamon'], calories: 280, protein: 8, carbs: 25, fat: 18, instructions: 'Slice apple and serve with almond butter.', prepTime: 3 },
          vegan: { name: 'Energy Balls', ingredients: ['Dates (4 pieces)', 'Cashews (20g)', 'Coconut flakes', 'Cocoa powder'], calories: 240, protein: 6, carbs: 28, fat: 12, instructions: 'Blend ingredients and form into balls.', prepTime: 10 }
        };
        
        const snack = snackOptions[profile.dietType as keyof typeof snackOptions] || snackOptions.omnivore;
        selectedMeals.push({ ...snack, id: (mealId++).toString(), type: 'snack' });
      }
      
      // Calculate totals
      const totalCalories = selectedMeals.reduce((sum, meal) => sum + meal.calories, 0);
      const totalProtein = selectedMeals.reduce((sum, meal) => sum + meal.protein, 0);
      const totalCarbs = selectedMeals.reduce((sum, meal) => sum + meal.carbs, 0);
      const totalFat = selectedMeals.reduce((sum, meal) => sum + meal.fat, 0);
      
      const newMealPlan: MealPlan = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        meals: selectedMeals,
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
      };

      setMealPlan(newMealPlan);
      setCurrentTab(1); // Switch to Diet Plan tab
    } catch (error) {
      console.error('Failed to generate meal plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderPersonalInfo = () => (
    <Grid container spacing={3}>
      <Grid size={12}>
        <Typography variant="h6" gutterBottom>Personal Information</Typography>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          label="Age"
          type="number"
          value={profile.age}
          onChange={(e) => setProfile(prev => ({ ...prev, age: Number(e.target.value) }))}
          inputProps={{ min: 10, max: 100 }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          select
          label="Gender"
          value={profile.gender}
          onChange={(e) => setProfile(prev => ({ ...prev, gender: e.target.value as 'male' | 'female' }))}
        >
          <MenuItem value="male">Male</MenuItem>
          <MenuItem value="female">Female</MenuItem>
        </TextField>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          label="Height (cm)"
          type="number"
          value={profile.height}
          onChange={(e) => setProfile(prev => ({ ...prev, height: Number(e.target.value) }))}
          inputProps={{ min: 120, max: 250 }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          label="Weight (kg)"
          type="number"
          value={profile.weight}
          onChange={(e) => setProfile(prev => ({ ...prev, weight: Number(e.target.value) }))}
          inputProps={{ min: 30, max: 200 }}
        />
      </Grid>
    </Grid>
  );

  const renderHealthGoals = () => (
    <Grid container spacing={3}>
      <Grid size={12}>
        <Typography variant="h6" gutterBottom>Activity Level</Typography>
        <TextField
          fullWidth
          select
          value={profile.activityLevel}
          onChange={(e) => setProfile(prev => ({ ...prev, activityLevel: e.target.value as any }))}
        >
          {activityLevels.map((level) => (
            <MenuItem key={level.value} value={level.value}>
              {level.label}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid size={12}>
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Fitness Goal</Typography>
        <Grid container spacing={2}>
          {goals.map((goal) => (
            <Grid size={{ xs: 12, sm: 6 }} key={goal.value}>
              <Card
                sx={{
                  cursor: 'pointer',
                  border: profile.goal === goal.value ? 2 : 1,
                  borderColor: profile.goal === goal.value ? 'primary.main' : 'divider',
                }}
                onClick={() => setProfile(prev => ({ ...prev, goal: goal.value as any }))}
              >
                <CardContent>
                  <Typography variant="subtitle1">{goal.label}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {goal.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Grid>
      <Grid size={12}>
        <TextField
          fullWidth
          label="Meals per day"
          type="number"
          value={profile.mealsPerDay}
          onChange={(e) => setProfile(prev => ({ ...prev, mealsPerDay: Number(e.target.value) }))}
          inputProps={{ min: 3, max: 6 }}
          sx={{ mt: 2 }}
        />
      </Grid>
    </Grid>
  );

  const renderPreferences = () => (
    <Grid container spacing={3}>
      <Grid size={12}>
        <Typography variant="h6" gutterBottom>Diet Type</Typography>
        <Grid container spacing={2}>
          {dietTypes.map((diet) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={diet.value}>
              <Card
                sx={{
                  cursor: 'pointer',
                  border: profile.dietType === diet.value ? 2 : 1,
                  borderColor: profile.dietType === diet.value ? 'primary.main' : 'divider',
                }}
                onClick={() => setProfile(prev => ({ ...prev, dietType: diet.value as any }))}
              >
                <CardContent>
                  <Typography variant="subtitle1">{diet.label}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {diet.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  );

  const renderSummary = () => (
    <Grid container spacing={3}>
      <Grid size={12}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Review your information before generating your personalized meal plan.
        </Alert>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Personal Details</Typography>
            <Typography>Age: {profile.age} years</Typography>
            <Typography>Gender: {profile.gender}</Typography>
            <Typography>Height: {profile.height} cm</Typography>
            <Typography>Weight: {profile.weight} kg</Typography>
            <Typography>Activity: {activityLevels.find(a => a.value === profile.activityLevel)?.label}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Calculated Targets</Typography>
            <Typography>Daily Calories: {profile.targetCalories} kcal</Typography>
            <Typography>Protein: {profile.macros?.protein}g</Typography>
            <Typography>Carbs: {profile.macros?.carbs}g</Typography>
            <Typography>Fat: {profile.macros?.fat}g</Typography>
            <Typography>Goal: {goals.find(g => g.value === profile.goal)?.label}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Preferences</Typography>
            <Typography>Diet Type: {dietTypes.find(d => d.value === profile.dietType)?.label}</Typography>
            <Typography>Meals per day: {profile.mealsPerDay}</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderAnalytics = () => {
    if (savedPlans.length === 0) {
      return (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <History sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Saved Diet Plans
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Generate and save diet plans to track your nutrition journey
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => setCurrentTab(1)}
              startIcon={<Restaurant />}
            >
              Create Your First Plan
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <Grid container spacing={3}>
        <Grid size={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp sx={{ mr: 1 }} />
                <Typography variant="h6">Nutrition Analytics</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid size={3}>
                  <Typography variant="h4" color="primary">{savedPlans.length}</Typography>
                  <Typography variant="body2">Saved Plans</Typography>
                </Grid>
                <Grid size={3}>
                  <Typography variant="h4" color="success.main">
                    {savedPlans.length > 0 ? Math.round(savedPlans.reduce((acc, plan) => acc + plan.totalCalories, 0) / savedPlans.length) : 0}
                  </Typography>
                  <Typography variant="body2">Avg Calories</Typography>
                </Grid>
                <Grid size={3}>
                  <Typography variant="h4" color="warning.main">
                    {savedPlans.length > 0 ? Math.round(savedPlans.reduce((acc, plan) => acc + plan.totalProtein, 0) / savedPlans.length) : 0}g
                  </Typography>
                  <Typography variant="body2">Avg Protein</Typography>
                </Grid>
                <Grid size={3}>
                  <Typography variant="h4" color="info.main">
                    {savedPlans.length > 0 ? Math.round(savedPlans.reduce((acc, plan) => acc + plan.meals.length, 0) / savedPlans.length) : 0}
                  </Typography>
                  <Typography variant="body2">Avg Meals</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={12}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <History sx={{ mr: 1 }} />
            Saved Diet Plans ({savedPlans.length})
          </Typography>
        </Grid>

        {savedPlans.map((plan) => (
          <Grid size={12} key={plan.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarToday sx={{ mr: 1, fontSize: 20 }} />
                      Diet Plan - {new Date(plan.date).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Saved on {plan.savedAt ? new Date(plan.savedAt).toLocaleDateString() : 'Unknown'} at {plan.savedAt ? new Date(plan.savedAt).toLocaleTimeString() : 'Unknown'}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => loadSavedPlan(plan)}
                      startIcon={<Restaurant />}
                    >
                      View Plan
                    </Button>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => deleteSavedPlan(plan.id)}
                    >
                      <Delete />
                    </IconButton>
                  </Stack>
                </Box>

                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid size={3}>
                    <Typography variant="h5" color="primary">{plan.totalCalories}</Typography>
                    <Typography variant="body2">Total Calories</Typography>
                  </Grid>
                  <Grid size={3}>
                    <Typography variant="h5" color="success.main">{plan.totalProtein}g</Typography>
                    <Typography variant="body2">Protein</Typography>
                  </Grid>
                  <Grid size={3}>
                    <Typography variant="h5" color="warning.main">{plan.totalCarbs}g</Typography>
                    <Typography variant="body2">Carbs</Typography>
                  </Grid>
                  <Grid size={3}>
                    <Typography variant="h5" color="error.main">{plan.totalFat}g</Typography>
                    <Typography variant="body2">Fat</Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ mb: 2 }} />

                <Typography variant="subtitle2" gutterBottom>Meals ({plan.meals.length}):</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                  {plan.meals.map((meal) => (
                    <Chip
                      key={meal.id}
                      label={`${meal.name} (${meal.calories} kcal)`}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderMealPlan = () => {
    if (!mealPlan) return null;

    return (
      <Grid container spacing={3}>
        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Daily Nutrition Summary</Typography>
              <Grid container spacing={2}>
                <Grid size={3}>
                  <Typography variant="h4" color="primary">{mealPlan.totalCalories}</Typography>
                  <Typography variant="body2">Calories</Typography>
                </Grid>
                <Grid size={3}>
                  <Typography variant="h4" color="success.main">{mealPlan.totalProtein}g</Typography>
                  <Typography variant="body2">Protein</Typography>
                </Grid>
                <Grid size={3}>
                  <Typography variant="h4" color="warning.main">{mealPlan.totalCarbs}g</Typography>
                  <Typography variant="body2">Carbs</Typography>
                </Grid>
                <Grid size={3}>
                  <Typography variant="h4" color="error.main">{mealPlan.totalFat}g</Typography>
                  <Typography variant="body2">Fat</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {mealPlan.meals.map((meal) => (
          <Grid size={12} key={meal.id}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <LocalDining sx={{ mr: 2 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6">{meal.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {meal.type.charAt(0).toUpperCase() + meal.type.slice(1)} • {meal.calories} kcal • {meal.prepTime} min
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2">P: {meal.protein}g</Typography>
                    <Typography variant="body2">C: {meal.carbs}g</Typography>
                    <Typography variant="body2">F: {meal.fat}g</Typography>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle1" gutterBottom>Ingredients:</Typography>
                    <List dense>
                      {meal.ingredients.map((ingredient, idx) => (
                        <ListItem key={idx}>
                          <ListItemIcon>
                            <CheckCircle color="success" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={ingredient} />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle1" gutterBottom>Instructions:</Typography>
                    <Typography variant="body2">{meal.instructions}</Typography>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>
        ))}

        <Grid size={12}>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button 
              variant="outlined"
              onClick={() => setCurrentTab(0)}
              startIcon={<Person />}
            >
              Create New Plan
            </Button>
            <Button 
              variant="contained"
              onClick={savePlan}
              disabled={savingPlan || !mealPlan}
              startIcon={savingPlan ? <CircularProgress size={20} /> : null}
            >
              {savingPlan ? 'Saving...' : 'Save Plan'}
            </Button>
          </Stack>
        </Grid>
      </Grid>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Personalized Diet Planner
      </Typography>

      {/* Persistent Navigation */}
      <Tabs value={currentTab} onChange={(_, v) => setCurrentTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="Setup" icon={<Person />} />
        <Tab label="Diet Plan" icon={<Restaurant />} />
        <Tab label="Analytics" icon={<Analytics />} />
      </Tabs>

      {/* Setup Tab - Profile Creation */}
      {currentTab === 0 && (
        <Card>
          <CardContent>
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {loading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" gutterBottom>Generating Your Personalized Diet Plan...</Typography>
                <LinearProgress sx={{ mt: 2 }} />
              </Box>
            ) : (
              <>
                {activeStep === 0 && renderPersonalInfo()}
                {activeStep === 1 && renderHealthGoals()}
                {activeStep === 2 && renderPreferences()}
                {activeStep === 3 && renderSummary()}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                  <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                  >
                    {activeStep === steps.length - 1 ? 'Generate Diet Plan' : 'Next'}
                  </Button>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Diet Plan Tab - Main View */}
      {currentTab === 1 && (
        <Box>
          {mealPlan ? (
            renderMealPlan()
          ) : (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <Restaurant sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No Diet Plan Generated
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Create your personalized diet plan by setting up your profile first
                </Typography>
                <Button 
                  variant="contained" 
                  onClick={() => setCurrentTab(0)}
                  startIcon={<Person />}
                >
                  Set Up Profile
                </Button>
              </CardContent>
            </Card>
          )}
        </Box>
      )}

      {/* Analytics Tab */}
      {currentTab === 2 && renderAnalytics()}
    </Box>
  );
}
