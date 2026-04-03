-- Create NGO Management Tables for Real-time Data

-- Relief Allocations Table
CREATE TABLE IF NOT EXISTS relief_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'delivered', 'cancelled')),
  destination VARCHAR(255) NOT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  allocated_by UUID REFERENCES auth.users(id),
  allocated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  estimated_delivery DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Food Resources Table
CREATE TABLE IF NOT EXISTS food_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'other' CHECK (category IN ('grains', 'vegetables', 'fruits', 'proteins', 'dairy', 'beverages', 'canned', 'other')),
  quantity INTEGER NOT NULL DEFAULT 0,
  unit VARCHAR(50) NOT NULL,
  expiry_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'low_stock', 'expired', 'distributed')),
  location VARCHAR(255) NOT NULL,
  supplier VARCHAR(255),
  cost_per_unit DECIMAL(10,2) DEFAULT 0,
  added_by UUID REFERENCES auth.users(id),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Volunteers Table
CREATE TABLE IF NOT EXISTS volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT,
  skills TEXT[], -- Array of skills
  availability VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (availability IN ('available', 'busy', 'unavailable')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending', 'suspended')),
  experience_level VARCHAR(20) NOT NULL DEFAULT 'beginner' CHECK (experience_level IN ('beginner', 'intermediate', 'experienced', 'expert')),
  emergency_contact VARCHAR(255),
  emergency_phone VARCHAR(20),
  background_checked BOOLEAN DEFAULT FALSE,
  training_completed BOOLEAN DEFAULT FALSE,
  hours_volunteered INTEGER DEFAULT 0,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_tasks INTEGER DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_relief_allocations_status ON relief_allocations(status);
CREATE INDEX IF NOT EXISTS idx_relief_allocations_priority ON relief_allocations(priority);
CREATE INDEX IF NOT EXISTS idx_relief_allocations_allocated_at ON relief_allocations(allocated_at);

CREATE INDEX IF NOT EXISTS idx_food_resources_status ON food_resources(status);
CREATE INDEX IF NOT EXISTS idx_food_resources_category ON food_resources(category);
CREATE INDEX IF NOT EXISTS idx_food_resources_expiry ON food_resources(expiry_date);

CREATE INDEX IF NOT EXISTS idx_volunteers_status ON volunteers(status);
CREATE INDEX IF NOT EXISTS idx_volunteers_availability ON volunteers(availability);
CREATE INDEX IF NOT EXISTS idx_volunteers_email ON volunteers(email);

-- Enable Row Level Security
ALTER TABLE relief_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Relief Allocations Policies
CREATE POLICY "Users can view relief allocations" 
  ON relief_allocations FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can insert relief allocations" 
  ON relief_allocations FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = allocated_by);

CREATE POLICY "Users can update their relief allocations" 
  ON relief_allocations FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = allocated_by);

CREATE POLICY "Users can delete their relief allocations" 
  ON relief_allocations FOR DELETE 
  TO authenticated 
  USING (auth.uid() = allocated_by);

-- Food Resources Policies
CREATE POLICY "Users can view food resources" 
  ON food_resources FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can insert food resources" 
  ON food_resources FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = added_by);

CREATE POLICY "Users can update their food resources" 
  ON food_resources FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = added_by);

CREATE POLICY "Users can delete their food resources" 
  ON food_resources FOR DELETE 
  TO authenticated 
  USING (auth.uid() = added_by);

-- Volunteers Policies
CREATE POLICY "Users can view volunteers" 
  ON volunteers FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can insert volunteers" 
  ON volunteers FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update volunteers" 
  ON volunteers FOR UPDATE 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can delete volunteers" 
  ON volunteers FOR DELETE 
  TO authenticated 
  USING (true);

-- Create functions to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_relief_allocations_updated_at 
  BEFORE UPDATE ON relief_allocations 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_food_resources_updated_at 
  BEFORE UPDATE ON food_resources 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_volunteers_updated_at 
  BEFORE UPDATE ON volunteers 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();