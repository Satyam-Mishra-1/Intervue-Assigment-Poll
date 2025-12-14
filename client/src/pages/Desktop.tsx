import { StarIcon } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";

const roleOptions = [
  {
    id: "student",
    title: "I'm a Student",
    description: "Submit answers and view live poll results in real-time.",
  },
  {
    id: "teacher",
    title: "I'm a Teacher",
    description: "Create polls, ask questions, and monitor student responses live.",
  },
];

export const Desktop = (): JSX.Element => {
  const [selectedRole, setSelectedRole] = useState<string>("student");
  const [, setLocation] = useLocation();

  const handleContinue = () => {
    if (selectedRole === "teacher") {
      setLocation("/teacher");
    } else {
      setLocation("/student");
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 w-full min-h-screen flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-12 w-full max-w-4xl">
        <div className="flex flex-col items-center gap-6">
          <Badge 
            className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-blue-600"
            data-testid="badge-intervue-poll"
          >
            <StarIcon className="w-4 h-4 fill-white text-white" />
            <span className="font-semibold text-white text-sm">
              Intervue Poll
            </span>
          </Badge>

          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-3xl md:text-4xl font-normal text-slate-900 dark:text-white">
              Welcome to the{" "}
              <span className="font-semibold">Live Polling System</span>
            </h1>

            <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl">
              Please select the role that best describes you to begin using the
              live polling system
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch gap-6 w-full max-w-2xl">
          {roleOptions.map((role) => (
            <Card
              key={role.id}
              className={`flex-1 cursor-pointer transition-all relative ${
                selectedRole === role.id
                  ? "ring-2 ring-purple-500 ring-offset-2"
                  : "border-slate-200 dark:border-slate-700"
              }`}
              onClick={() => setSelectedRole(role.id)}
              data-testid={`card-role-${role.id}`}
            >
              <CardContent className="flex flex-col items-start justify-center gap-4 p-6 h-full">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    selectedRole === role.id 
                      ? "border-purple-500 bg-purple-500" 
                      : "border-slate-300 dark:border-slate-600"
                  }`}>
                    {selectedRole === role.id && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <h2 className="font-semibold text-xl text-slate-900 dark:text-white">
                    {role.title}
                  </h2>
                </div>

                <p className="text-slate-500 dark:text-slate-400 text-base">
                  {role.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button 
          onClick={handleContinue}
          className="px-12 py-6 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-lg font-semibold"
          data-testid="button-continue"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};
