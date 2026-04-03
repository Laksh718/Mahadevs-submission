# Quick Reference: Adding Beautiful UI to Any Page

## Step 1: Import Required Components

```tsx
import { motion, AnimatePresence } from "framer-motion";
import GradientCard from "@/components/GradientCard";
import AnimatedCard from "@/components/AnimatedCard";
// AnimatedBackground is already in layout components
```

## Step 2: Animated Page Header

```tsx
<motion.div 
  className="text-center space-y-4 mb-8"
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
  <motion.h1
    className="text-5xl font-black bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent"
    initial={{ scale: 0.9 }}
    animate={{ scale: 1 }}
    transition={{ duration: 0.5, delay: 0.2 }}
  >
    Your Page Title
  </motion.h1>
  <motion.p 
    className="text-lg text-gray-700 font-medium"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5, delay: 0.4 }}
  >
    Your page description
  </motion.p>
</motion.div>
```

## Step 3: Stat Cards Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {stats.map((stat, index) => (
    <AnimatedCard key={stat.id} delay={index * 0.1}>
      <Card className="bg-gradient-to-br from-blue-50 via-cyan-50 to-white border-2 border-blue-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">
            {stat.title}
          </CardTitle>
          <div className="p-2 bg-blue-100 rounded-lg">
            <Icon className="h-5 w-5 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            {stat.value}
          </div>
          <p className="text-xs text-gray-600 mt-1 font-medium">
            {stat.description}
          </p>
        </CardContent>
      </Card>
    </AnimatedCard>
  ))}
</div>
```

## Step 4: Action Buttons

```tsx
<GradientCard variant="primary" glow className="p-6">
  <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
    Quick Actions
  </h3>
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {actions.map((action, index) => (
      <motion.div
        key={action.id}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        whileHover={{ scale: 1.05, y: -5 }}
      >
        <Button
          className="w-full h-24 flex-col bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 hover:border-blue-300"
          onClick={action.onClick}
        >
          <div className="p-2 bg-blue-100 rounded-lg mb-2">
            <action.icon className="w-6 h-6 text-blue-600" />
          </div>
          <span className="text-sm font-semibold">{action.label}</span>
        </Button>
      </motion.div>
    ))}
  </div>
</GradientCard>
```

## Step 5: Animated List/Feed

```tsx
<GradientCard variant="default" className="p-6">
  <h3 className="text-xl font-bold mb-4">Recent Items</h3>
  <AnimatePresence>
    {items.map((item, index) => (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        whileHover={{ x: 5 }}
      >
        <div className="p-4 mb-3 bg-gradient-to-r from-white to-gray-50 border-2 border-gray-200 rounded-xl hover:shadow-lg transition-all">
          {/* Item content */}
        </div>
      </motion.div>
    ))}
  </AnimatePresence>
</GradientCard>
```

## Step 6: Interactive Cards

```tsx
<motion.div
  whileHover={{ scale: 1.02, y: -5 }}
  whileTap={{ scale: 0.98 }}
  transition={{ duration: 0.2 }}
>
  <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-white border-2 border-purple-200 cursor-pointer">
    <CardHeader>
      <CardTitle className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        Interactive Card
      </CardTitle>
    </CardHeader>
    <CardContent>
      {/* Content */}
    </CardContent>
  </Card>
</motion.div>
```

## Step 7: Loading States

```tsx
{loading ? (
  <motion.div
    className="flex items-center justify-center py-12"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <motion.div
      className="flex flex-col items-center space-y-4"
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-600 font-medium">Loading...</p>
    </motion.div>
  </motion.div>
) : (
  <YourContent />
)}
```

## Step 8: Empty States

```tsx
<motion.div
  className="text-center py-12"
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.5 }}
>
  <motion.div
    className="p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center"
    animate={{ rotate: [0, 5, -5, 0] }}
    transition={{ duration: 2, repeat: Infinity }}
  >
    <Icon className="w-10 h-10 text-gray-400" />
  </motion.div>
  <h3 className="text-lg font-semibold text-gray-700 mb-2">No Items Found</h3>
  <p className="text-gray-500 mb-4">Get started by adding your first item</p>
  <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
    <Plus className="w-4 h-4 mr-2" />
    Add New Item
  </Button>
</motion.div>
```

## Color Combinations by Severity/Type

### Critical/Danger
```tsx
className="bg-gradient-to-br from-red-50 via-rose-50 to-white border-2 border-red-200"
text="bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent"
icon="bg-red-100 text-red-600"
```

### Warning/High
```tsx
className="bg-gradient-to-br from-orange-50 via-amber-50 to-white border-2 border-orange-200"
text="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent"
icon="bg-orange-100 text-orange-600"
```

### Info/Medium
```tsx
className="bg-gradient-to-br from-blue-50 via-cyan-50 to-white border-2 border-blue-200"
text="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent"
icon="bg-blue-100 text-blue-600"
```

### Success/Low
```tsx
className="bg-gradient-to-br from-green-50 via-emerald-50 to-white border-2 border-green-200"
text="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
icon="bg-green-100 text-green-600"
```

## Animation Timing Guide

- **Page Entry**: 0.5-0.6s with 0.2s delays between elements
- **Hover Effects**: 0.2s
- **Button Press**: 0.1s
- **List Items**: 0.3s with 0.05-0.1s stagger
- **Modal/Dialog**: 0.3s
- **Loading Spinners**: 1.5s repeat

## Common Mistakes to Avoid

❌ **Don't**: Use plain white backgrounds
```tsx
<Card className="bg-white">
```

✅ **Do**: Use gradient backgrounds
```tsx
<Card className="bg-gradient-to-br from-white via-gray-50 to-blue-50">
```

❌ **Don't**: Forget animation delays
```tsx
<motion.div animate={{ opacity: 1 }}>
```

✅ **Do**: Add delays for staggering
```tsx
<motion.div animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
```

❌ **Don't**: Overuse animations
```tsx
animate={{ scale: [1, 2, 1], rotate: 360, x: 100 }}
```

✅ **Do**: Keep animations subtle
```tsx
whileHover={{ scale: 1.02, y: -5 }}
```

## Complete Page Template

```tsx
import { motion, AnimatePresence } from "framer-motion";
import GradientCard from "@/components/GradientCard";
import AnimatedCard from "@/components/AnimatedCard";
import YourLayout from "@/components/YourLayout";

const YourPage = () => {
  return (
    <YourLayout>
      {/* Animated Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h1 className="text-5xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          Page Title
        </h1>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <AnimatedCard key={i} delay={i * 0.1}>
            {/* Stat content */}
          </AnimatedCard>
        ))}
      </div>

      {/* Main Content */}
      <GradientCard variant="primary" glow>
        {/* Your content */}
      </GradientCard>
    </YourLayout>
  );
};

export default YourPage;
```

## Resources

- Framer Motion docs: https://www.framer.com/motion/
- Tailwind gradients: https://tailwindcss.com/docs/gradient-color-stops
- Shadcn components: https://ui.shadcn.com/

## Need Help?

Check these files for examples:
- `src/pages/UserDashboard.tsx` - Stat cards
- `src/pages/Landing.tsx` - Hero animations
- `src/pages/Alerts.tsx` - Settings animations
- `src/components/AnimatedCard.tsx` - Card animations
- `src/components/AnimatedBackground.tsx` - Background effects
