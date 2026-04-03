-- Create relief_allocations table
CREATE TABLE IF NOT EXISTS relief_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'delivered', 'cancelled')),
  priority VARCHAR(50) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  destination VARCHAR(500) NOT NULL,
  coordinates JSONB,
  requester VARCHAR(255) NOT NULL,
  contact VARCHAR(255) NOT NULL,
  notes TEXT,
  estimated_delivery TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create food_resources table
CREATE TABLE IF NOT EXISTS food_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL CHECK (category IN ('grains', 'vegetables', 'fruits', 'dairy', 'protein', 'beverages', 'packaged', 'baby_food')),
  quantity INTEGER NOT NULL DEFAULT 0,
  unit VARCHAR(100) NOT NULL,
  expiry_date DATE,
  storage_temperature VARCHAR(100),
  location VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'distributed', 'expired')),
  donated_by VARCHAR(255),
  received_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  nutritional_info VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create volunteers table
CREATE TABLE IF NOT EXISTS volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  skills TEXT[], -- Array of skills
  availability VARCHAR(50) NOT NULL DEFAULT 'available' CHECK (availability IN ('available', 'busy', 'offline')),
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  location VARCHAR(255),
  experience_level VARCHAR(50) NOT NULL DEFAULT 'beginner' CHECK (experience_level IN ('beginner', 'intermediate', 'experienced', 'expert')),
  languages TEXT[], -- Array of languages
  emergency_contact VARCHAR(255),
  medical_info TEXT,
  notes TEXT,
  joined_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE,
  completed_tasks INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 5.0,
  certifications TEXT[], -- Array of certifications
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_relief_allocations_status ON relief_allocations(status);
CREATE INDEX IF NOT EXISTS idx_relief_allocations_priority ON relief_allocations(priority);
CREATE INDEX IF NOT EXISTS idx_relief_allocations_created_at ON relief_allocations(created_at);

CREATE INDEX IF NOT EXISTS idx_food_resources_category ON food_resources(category);
CREATE INDEX IF NOT EXISTS idx_food_resources_status ON food_resources(status);
CREATE INDEX IF NOT EXISTS idx_food_resources_expiry_date ON food_resources(expiry_date);

CREATE INDEX IF NOT EXISTS idx_volunteers_status ON volunteers(status);
CREATE INDEX IF NOT EXISTS idx_volunteers_availability ON volunteers(availability);
CREATE INDEX IF NOT EXISTS idx_volunteers_email ON volunteers(email);

-- Enable Row Level Security
ALTER TABLE relief_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;

-- Create policies for NGO and VOLUNTEER roles
CREATE POLICY "NGO and volunteers can manage relief allocations" ON relief_allocations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role IN ('NGO', 'VOLUNTEER')
    )
  );

CREATE POLICY "NGO and volunteers can manage food resources" ON food_resources
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role IN ('NGO', 'VOLUNTEER')
    )
  );

CREATE POLICY "NGO and volunteers can manage volunteers" ON volunteers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role IN ('NGO', 'VOLUNTEER')
    )
  );

-- Create triggers to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_relief_allocations_updated_at BEFORE UPDATE ON relief_allocations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_food_resources_updated_at BEFORE UPDATE ON food_resources FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_volunteers_updated_at BEFORE UPDATE ON volunteers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();