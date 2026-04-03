import FloodDamageAnalysis from "@/components/FloodDamageAnalysis";
import UserLayout from "@/components/UserLayout";

const Assessment = () => {
  return (
    <UserLayout title="Risk Assessment" description="Assess your flood risk and damage analysis">
      <div className="space-y-8">
        <FloodDamageAnalysis />
      </div>
    </UserLayout>
  );
};

export default Assessment;
