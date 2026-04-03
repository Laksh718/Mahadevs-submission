/**
 * Flood Spread Simulation Engine
 * Simulates flood propagation based on terrain, weather, and hydrological data
 */

export interface SimulationPoint {
  x: number;
  y: number;
  waterLevel: number;
  timestamp: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
}

export interface FloodZone {
  id: string;
  name: string;
  coordinates: { lat: number; lon: number }[];
  elevation: number;
  population: number;
  infrastructure: string[];
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  evacuationTime: number; // minutes
}

export interface SimulationConfig {
  timeStep: number; // minutes
  totalTime: number; // minutes
  gridSize: number;
  terrainData: number[][];
  waterSource: { x: number; y: number; intensity: number };
}

class FloodSimulation {
  private grid: number[][];
  private waterLevels: number[][];
  private riskMap: string[][];
  private timeStep: number;
  private currentTime: number;
  private isRunning: boolean;
  private simulationData: SimulationPoint[];

  constructor() {
    this.grid = [];
    this.waterLevels = [];
    this.riskMap = [];
    this.timeStep = 5; // 5 minutes
    this.currentTime = 0;
    this.isRunning = false;
    this.simulationData = [];
  }

  /**
   * Initialize simulation with Punjab terrain data
   */
  initializeSimulation(config: SimulationConfig): void {
    this.grid = config.terrainData;
    this.waterLevels = Array(config.gridSize).fill(null).map(() => 
      Array(config.gridSize).fill(0)
    );
    this.riskMap = Array(config.gridSize).fill(null).map(() => 
      Array(config.gridSize).fill('low')
    );
    this.timeStep = config.timeStep;
    this.currentTime = 0;
    this.simulationData = [];
  }

  /**
   * Run flood simulation
   */
  runSimulation(config: SimulationConfig): SimulationPoint[] {
    this.initializeSimulation(config);
    this.isRunning = true;

    const maxSteps = Math.floor(config.totalTime / this.timeStep);
    
    for (let step = 0; step < maxSteps; step++) {
      this.simulateStep(config);
      this.currentTime += this.timeStep;
    }

    this.isRunning = false;
    return this.simulationData;
  }

  /**
   * Simulate one time step
   */
  private simulateStep(config: SimulationConfig): void {
    const newWaterLevels = this.waterLevels.map(row => [...row]);
    
    // Apply water source
    const source = config.waterSource;
    newWaterLevels[source.y][source.x] += source.intensity * this.timeStep / 60;
    
    // Simulate water flow
    for (let y = 0; y < config.gridSize; y++) {
      for (let x = 0; x < config.gridSize; x++) {
        if (this.waterLevels[y][x] > 0) {
          this.simulateWaterFlow(x, y, newWaterLevels, config);
        }
      }
    }
    
    this.waterLevels = newWaterLevels;
    this.updateRiskMap();
    this.recordSimulationData();
  }

  /**
   * Simulate water flow between adjacent cells
   */
  private simulateWaterFlow(x: number, y: number, newWaterLevels: number[][], config: SimulationConfig): void {
    const currentLevel = this.waterLevels[y][x];
    const currentElevation = this.grid[y][x];
    
    // Check 8 neighboring cells
    const neighbors = [
      { dx: -1, dy: -1 }, { dx: 0, dy: -1 }, { dx: 1, dy: -1 },
      { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
      { dx: -1, dy: 1 }, { dx: 0, dy: 1 }, { dx: 1, dy: 1 }
    ];
    
    for (const neighbor of neighbors) {
      const nx = x + neighbor.dx;
      const ny = y + neighbor.dy;
      
      if (nx >= 0 && nx < config.gridSize && ny >= 0 && ny < config.gridSize) {
        const neighborElevation = this.grid[ny][nx];
        const neighborLevel = this.waterLevels[ny][nx];
        
        // Calculate flow based on elevation difference
        const elevationDiff = currentElevation - neighborElevation;
        const levelDiff = currentLevel - neighborLevel;
        
        if (elevationDiff > 0 && levelDiff > 0) {
          // Water flows downhill
          const flowRate = Math.min(
            (elevationDiff + levelDiff) * 0.1,
            currentLevel * 0.3
          );
          
          newWaterLevels[y][x] -= flowRate;
          newWaterLevels[ny][nx] += flowRate;
        }
      }
    }
  }

  /**
   * Update risk map based on water levels
   */
  private updateRiskMap(): void {
    for (let y = 0; y < this.waterLevels.length; y++) {
      for (let x = 0; x < this.waterLevels[y].length; x++) {
        const waterLevel = this.waterLevels[y][x];
        const elevation = this.grid[y][x];
        
        if (waterLevel > elevation + 2) {
          this.riskMap[y][x] = 'critical';
        } else if (waterLevel > elevation + 1) {
          this.riskMap[y][x] = 'high';
        } else if (waterLevel > elevation + 0.5) {
          this.riskMap[y][x] = 'moderate';
        } else if (waterLevel > 0) {
          this.riskMap[y][x] = 'low';
        } else {
          this.riskMap[y][x] = 'low';
        }
      }
    }
  }

  /**
   * Record simulation data for current time step
   */
  private recordSimulationData(): void {
    for (let y = 0; y < this.waterLevels.length; y++) {
      for (let x = 0; x < this.waterLevels[y].length; x++) {
        const waterLevel = this.waterLevels[y][x];
        if (waterLevel > 0) {
          this.simulationData.push({
            x,
            y,
            waterLevel,
            timestamp: this.currentTime,
            riskLevel: this.riskMap[y][x] as 'low' | 'moderate' | 'high' | 'critical'
          });
        }
      }
    }
  }

  /**
   * Get flood zones for Punjab region
   */
  getFloodZones(): FloodZone[] {
    return [
      {
        id: 'riverside_district',
        name: 'Riverside District',
        coordinates: [
          { lat: 30.7400, lon: 76.7800 },
          { lat: 30.7500, lon: 76.7900 },
          { lat: 30.7600, lon: 76.8000 },
          { lat: 30.7500, lon: 76.8100 }
        ],
        elevation: 220,
        population: 25000,
        infrastructure: ['Schools', 'Hospitals', 'Markets'],
        riskLevel: 'critical',
        evacuationTime: 30
      },
      {
        id: 'industrial_zone',
        name: 'Industrial Zone',
        coordinates: [
          { lat: 30.7200, lon: 76.7500 },
          { lat: 30.7300, lon: 76.7600 },
          { lat: 30.7400, lon: 76.7700 },
          { lat: 30.7300, lon: 76.7800 }
        ],
        elevation: 240,
        population: 15000,
        infrastructure: ['Factories', 'Warehouses', 'Power Plants'],
        riskLevel: 'high',
        evacuationTime: 45
      },
      {
        id: 'downtown_area',
        name: 'Downtown Area',
        coordinates: [
          { lat: 30.7600, lon: 76.7200 },
          { lat: 30.7700, lon: 76.7300 },
          { lat: 30.7800, lon: 76.7400 },
          { lat: 30.7700, lon: 76.7500 }
        ],
        elevation: 260,
        population: 40000,
        infrastructure: ['Government Buildings', 'Banks', 'Shopping Centers'],
        riskLevel: 'moderate',
        evacuationTime: 60
      },
      {
        id: 'residential_blocks',
        name: 'Residential Blocks',
        coordinates: [
          { lat: 30.7000, lon: 76.7000 },
          { lat: 30.7100, lon: 76.7100 },
          { lat: 30.7200, lon: 76.7200 },
          { lat: 30.7100, lon: 76.7300 }
        ],
        elevation: 250,
        population: 35000,
        infrastructure: ['Housing', 'Schools', 'Community Centers'],
        riskLevel: 'low',
        evacuationTime: 90
      }
    ];
  }

  /**
   * Generate terrain data for Punjab region
   */
  generateTerrainData(gridSize: number): number[][] {
    const terrain: number[][] = [];
    
    for (let y = 0; y < gridSize; y++) {
      const row: number[] = [];
      for (let x = 0; x < gridSize; x++) {
        // Generate elevation based on distance from center and noise
        const centerX = gridSize / 2;
        const centerY = gridSize / 2;
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);
        
        // Base elevation decreases from center
        const baseElevation = 300 - (distance / maxDistance) * 100;
        
        // Add noise for realistic terrain
        const noise = (Math.random() - 0.5) * 20;
        
        // Add some river valleys (lower elevation)
        const riverDistance = Math.abs(y - centerY);
        const riverEffect = riverDistance < 5 ? -30 : 0;
        
        row.push(Math.max(200, baseElevation + noise + riverEffect));
      }
      terrain.push(row);
    }
    
    return terrain;
  }

  /**
   * Get simulation status
   */
  getSimulationStatus(): {
    isRunning: boolean;
    currentTime: number;
    totalPoints: number;
    criticalPoints: number;
  } {
    const criticalPoints = this.simulationData.filter(
      point => point.riskLevel === 'critical'
    ).length;
    
    return {
      isRunning: this.isRunning,
      currentTime: this.currentTime,
      totalPoints: this.simulationData.length,
      criticalPoints
    };
  }

  /**
   * Reset simulation
   */
  reset(): void {
    this.waterLevels = this.waterLevels.map(row => row.map(() => 0));
    this.riskMap = this.riskMap.map(row => row.map(() => 'low'));
    this.currentTime = 0;
    this.simulationData = [];
    this.isRunning = false;
  }
}

export const floodSimulation = new FloodSimulation();
