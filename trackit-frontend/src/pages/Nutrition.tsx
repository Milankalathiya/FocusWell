import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import {
  Alert,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { format, subDays } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import {
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { nutritionApi } from '../services/api';

const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

export default function Nutrition() {
  const { state } = useAuth();
  const token = state.token || localStorage.getItem('focuswell_token') || '';
  const today = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);

  // Profile & summary
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [computed, setComputed] = useState<any>(null);

  // Daily summary/logs
  const [summary, setSummary] = useState<{
    caloriesTarget: number;
    caloriesConsumed: number;
  } | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [foods, setFoods] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [qty, setQty] = useState<number>(1);
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [mealType, setMealType] = useState<string>('breakfast');

  // Profile edit
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState<any>({});
  const [weightInput, setWeightInput] = useState('');

  // Meal plan
  const [planDays, setPlanDays] = useState(1);
  const [planMealsPerDay, setPlanMealsPerDay] = useState(4);
  const [plan, setPlan] = useState<any>(null);

  // Analytics
  const [analytics, setAnalytics] = useState<any>(null);
  const [range, setRange] = useState<{ start: string; end: string }>({
    start: format(subDays(new Date(), 6), 'yyyy-MM-dd'),
    end: today,
  });

  // Feedback/alerts
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadProfile = async () => {
    const data = await nutritionApi.getNutritionProfile(token);
    setProfile(data.profile);
    setComputed(data.computed);
    setForm({
      sex: data.profile?.sex || 'male',
      birthdate: data.profile?.birthdate || '',
      heightCm: data.profile?.heightCm || 170,
      weightKg: data.profile?.weightKg || 70,
      activityLevel: data.profile?.activityLevel || 'moderate',
      dietaryPref: data.profile?.dietaryPref || 'omnivore',
      goal: data.profile?.goal || 'maintain',
    });
  };

  const loadSummary = async () => {
    const data = await nutritionApi.getMealsForDay(token, today);
    setSummary(data.summary);
    setLogs(data.logs || []);
  };

  const loadPlanForToday = async () => {
    const data = await nutritionApi.getMealPlanForDay(token, today);
    setPlan({ generatedAt: new Date().toISOString(), days: [data], notes: [] });
  };

  const loadAnalytics = async () => {
    const data = await nutritionApi.getAnalyticsSummary(
      token,
      range.start,
      range.end
    );
    setAnalytics(data);

    // Feedback/alerts
    if (data && data.daily && data.targets) {
      const last = data.daily[data.daily.length - 1];
      if (last) {
        if (last.calories > data.targets.calories * 1.1)
          setFeedback('You exceeded your calorie target yesterday.');
        else if (last.calories < data.targets.calories * 0.9)
          setFeedback('You were below your calorie target yesterday.');
        else setFeedback(null);
      }
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await loadProfile();
        await Promise.all([loadSummary(), loadPlanForToday()]);
        await loadAnalytics();
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line
  }, [token, today]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await loadProfile();
        await Promise.all([
          loadSummary(),
          loadPlansForRange(range.start, range.end),
        ]);
        await loadAnalytics();
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line
  }, [token, range.start, range.end]);

  const onSearch = async () => {
    const res = await nutritionApi.searchFoods(token, query);
    setFoods(res);
  };

  const onQuickLog = async () => {
    if (!selectedFood) return;
    const logDate = today;
    const calories = (selectedFood.calories || 0) * qty;
    await nutritionApi.logMeal(token, {
      date: logDate,
      mealType,
      items: [
        {
          title: selectedFood.name,
          qty,
          unit: selectedFood.servingUnit,
          calories,
        },
      ],
    });
    setSelectedFood(null);
    setQty(1);
    await loadSummary();
    await loadAnalytics();
  };

  const onSaveProfile = async () => {
    await nutritionApi.updateProfile(token, form);
    setEditOpen(false);
    await loadProfile();
    await loadAnalytics();
  };

  const onLogWeight = async () => {
    const v = parseFloat(weightInput);
    if (!v || v <= 0) return;
    await nutritionApi.logWeight(token, {
      date: today,
      weightKg: v,
      notes: '',
    });
    setWeightInput('');
    await loadAnalytics();
  };

  const onGeneratePlan = async () => {
    const res = await nutritionApi.generateMealPlan(token, {
      days: planDays,
      mealsPerDay: planMealsPerDay,
    });
    setPlan(res);

    for (const day of res.days) {
      await nutritionApi.saveMealPlan(token, day);
    }
  };

  const loadPlansForRange = async (start: string, end: string) => {
  try {
    const res = await nutritionApi.getMealPlansForRange(token, start, end);
    setPlan({ days: res });
  } catch (error) {
    console.error('Failed to load meal plans:', error);
  }
};

  const onAddPlanDayToLog = async (day: any) => {
    if (day.date !== today) {
      alert('You can only log meals for today.');
      return;
    }
    for (const meal of day.meals) {
      await nutritionApi.logMeal(token, {
        date: today,
        mealType: meal.mealType,
        items: [
          {
            title: meal.title,
            qty: 1,
            unit: 'serving',
            calories: meal.calories,
          },
        ],
      });
    }
    await loadSummary();
    await loadAnalytics();
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Nutrition
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Track nutrition goals, meal plans, daily logs, and analytics.
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Profile & Targets
            </Typography>
            {loading ? (
              <Typography variant="body2" color="text.secondary">
                Loading...
              </Typography>
            ) : (
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Sex: {profile?.sex || '—'} | Activity:{' '}
                  {profile?.activityLevel || '—'} | Goal: {profile?.goal || '—'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Height: {profile?.heightCm ? `${profile.heightCm} cm` : '—'} |
                  Weight: {profile?.weightKg ? `${profile.weightKg} kg` : '—'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Dietary: {profile?.dietaryPref || '—'}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2">
                  BMR: {computed?.BMR ?? '—'} kcal
                </Typography>
                <Typography variant="body2">
                  TDEE: {computed?.TDEE ?? '—'} kcal
                </Typography>
                <Typography variant="body2">
                  Target: {computed?.calorieTarget ?? '—'} kcal
                </Typography>
                {computed?.macros && (
                  <Typography variant="body2" color="text.secondary">
                    Macros: P {computed.macros.protein_g}g / C{' '}
                    {computed.macros.carbs_g}g / F {computed.macros.fat_g}g
                  </Typography>
                )}
              </Stack>
            )}
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button variant="contained" onClick={() => setEditOpen(true)}>
                Edit Profile
              </Button>
              <TextField
                size="small"
                placeholder="Weight (kg)"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                sx={{ width: 140 }}
              />
              <Button variant="outlined" onClick={onLogWeight}>
                Log Weight
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Today Summary
            </Typography>
            {summary ? (
              <Stack spacing={1}>
                <Typography variant="body2">
                  Target: {Math.round(summary.caloriesTarget)} kcal
                </Typography>
                <Typography variant="body2">
                  Consumed: {Math.round(summary.caloriesConsumed)} kcal
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2">Today's Meals</Typography>
                <Stack spacing={0.5}>
                  {logs.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      No meals logged yet.
                    </Typography>
                  )}
                  {logs.map((l) => (
                    <div
                      key={l.id}
                      style={{ display: 'flex', alignItems: 'center' }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 500, flex: 1 }}
                      >
                        {l.mealType} • {Math.round(l.totalCalories || 0)} kcal
                      </Typography>
                      <Button
                        size="small"
                        color="error"
                        onClick={async () => {
                          await nutritionApi.deleteMeal(token, l.id);
                          await loadSummary();
                          await loadAnalytics();
                        }}
                      >
                        Delete
                      </Button>
                      <div style={{ flexBasis: '100%' }} />
                      {Array.isArray(l.items) &&
                        l.items.map((item: any, idx: number) => (
                          <Typography
                            key={idx}
                            variant="body2"
                            color="text.secondary"
                            sx={{ pl: 2 }}
                          >
                            - {item.title} ({item.qty} {item.unit}) •{' '}
                            {Math.round(item.calories)} kcal
                          </Typography>
                        ))}
                    </div>
                  ))}
                </Stack>
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No data yet.
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Analytics Section */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Analytics
            </Typography>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <TextField
                type="date"
                label="Start"
                value={range.start}
                onChange={(e) =>
                  setRange((r) => ({ ...r, start: e.target.value }))
                }
                size="small"
                sx={{ width: 160 }}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                type="date"
                label="End"
                value={range.end}
                onChange={(e) =>
                  setRange((r) => ({ ...r, end: e.target.value }))
                }
                size="small"
                sx={{ width: 160 }}
                InputLabelProps={{ shrink: true }}
              />
              <Button onClick={loadAnalytics}>Refresh</Button>
            </Stack>
            {feedback && (
              <Alert severity="info" sx={{ mb: 2 }}>
                {feedback}
              </Alert>
            )}
            {analytics && (
              <Stack spacing={2}>
                <Typography variant="body2">
                  Adherence: {analytics.adherencePct?.toFixed(1) ?? 0}% of days
                  on target
                </Typography>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={analytics.daily}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="calories"
                      stroke="#1976d2"
                      name="Calories"
                    />
                    <Line
                      type="monotone"
                      dataKey="protein"
                      stroke="#43a047"
                      name="Protein (g)"
                    />
                    <Line
                      type="monotone"
                      dataKey="carbs"
                      stroke="#fbc02d"
                      name="Carbs (g)"
                    />
                    <Line
                      type="monotone"
                      dataKey="fat"
                      stroke="#e53935"
                      name="Fat (g)"
                    />
                  </LineChart>
                </ResponsiveContainer>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={analytics.weightTrend}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="weightKg"
                      stroke="#8e24aa"
                      name="Weight (kg)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Stack>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Meal Plan Generator */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Meal Plan Generator
            </Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                select
                label="Days"
                size="small"
                value={planDays}
                onChange={(e) => setPlanDays(Number(e.target.value))}
                sx={{ width: 120 }}
              >
                {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Meals/Day"
                size="small"
                value={planMealsPerDay}
                onChange={(e) => setPlanMealsPerDay(Number(e.target.value))}
                sx={{ width: 160 }}
              >
                {[3, 4].map((d) => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </TextField>
              <Button variant="contained" onClick={onGeneratePlan}>
                Generate Plan
              </Button>
            </Stack>
            {plan && (
              <Stack spacing={2} sx={{ mt: 2 }}>
                {plan.days.map((d: any) => (
                  <Card key={d.date} variant="outlined">
                    <CardContent>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="subtitle1">
                          {d.date} • {Math.round(d.dayTotals.calories)} kcal
                        </Typography>
                        <Button
                          size="small"
                          onClick={() => onAddPlanDayToLog(d)}
                        >
                          Add to Log
                        </Button>
                      </Stack>
                      <Divider sx={{ my: 1 }} />
                      <Stack spacing={0.5}>
                        {d.meals.map((m: any, idx: number) => (
                          <Typography key={idx} variant="body2">
                            {m.mealType}: {m.title} • {Math.round(m.calories)}{' '}
                            kcal
                          </Typography>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Quick Add: Food Search & Log */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Quick Add: Food Search & Log
            </Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                select
                label="Meal"
                size="small"
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                sx={{ width: 160 }}
              >
                {mealTypes.map((m) => (
                  <MenuItem key={m} value={m}>
                    {m}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                placeholder="Search foods (e.g., oats, milk)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="contained"
                onClick={onSearch}
                startIcon={<SearchIcon />}
              >
                Search
              </Button>
            </Stack>

            {foods.length > 0 && (
              <Stack spacing={1} sx={{ mt: 2 }}>
                {foods.slice(0, 5).map((f) => (
                  <Stack
                    key={f.id}
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      border: '1px solid var(--border-light)',
                    }}
                  >
                    <Stack sx={{ flex: 1 }}>
                      <Typography variant="subtitle2">{f.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {Math.round(f.calories)} kcal / {f.servingSize}{' '}
                        {f.servingUnit}
                      </Typography>
                    </Stack>
                    <TextField
                      type="number"
                      size="small"
                      value={selectedFood?.id === f.id ? qty : 1}
                      onChange={(e) => {
                        setSelectedFood(f);
                        setQty(Math.max(0.1, Number(e.target.value)));
                      }}
                      inputProps={{ step: 0.1, min: 0.1 }}
                      sx={{ width: 120 }}
                    />
                    <IconButton
                      color="primary"
                      onClick={() => {
                        setSelectedFood(f);
                        onQuickLog();
                      }}
                    >
                      <AddIcon />
                    </IconButton>
                  </Stack>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Edit Profile Dialog */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit Nutrition Profile</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Birthdate"
              placeholder="YYYY-MM-DD"
              value={form.birthdate || ''}
              onChange={(e) => setForm({ ...form, birthdate: e.target.value })}
            />
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="Sex"
                value={form.sex}
                onChange={(e) => setForm({ ...form, sex: e.target.value })}
              />
              <TextField
                label="Activity"
                value={form.activityLevel}
                onChange={(e) =>
                  setForm({ ...form, activityLevel: e.target.value })
                }
              />
              <TextField
                label="Goal"
                value={form.goal}
                onChange={(e) => setForm({ ...form, goal: e.target.value })}
              />
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="Height (cm)"
                type="number"
                value={form.heightCm}
                onChange={(e) =>
                  setForm({ ...form, heightCm: Number(e.target.value) })
                }
              />
              <TextField
                label="Weight (kg)"
                type="number"
                value={form.weightKg}
                onChange={(e) =>
                  setForm({ ...form, weightKg: Number(e.target.value) })
                }
              />
            </Stack>
            <TextField
              label="Dietary Pref"
              value={form.dietaryPref}
              onChange={(e) =>
                setForm({ ...form, dietaryPref: e.target.value })
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={onSaveProfile}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}
