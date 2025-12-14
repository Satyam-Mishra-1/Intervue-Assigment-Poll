import { StarIcon } from "lucide-react";
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const roleOptions = [
  {
    id: "student",
    title: "I'm a Student",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry",
  },
  {
    id: "teacher",
    title: "I'm a Teacher",
    description: "Submit answers and view live poll results in real-time.",
  },
];

export const Desktop = (): JSX.Element => {
  const [selectedRole, setSelectedRole] = useState<string>("student");

  return (
    <div className="bg-white w-full min-w-[1440px] min-h-[923px] flex items-center justify-center">
      <div className="flex flex-col items-center gap-[69px] w-[981px]">
        <div className="flex flex-col items-center gap-[26px]">
          <Badge className="flex items-center justify-center gap-[7px] px-[9px] py-0 h-[31px] rounded-3xl bg-[linear-gradient(90deg,rgba(117,101,217,1)_0%,rgba(77,10,205,1)_100%)] hover:bg-[linear-gradient(90deg,rgba(117,101,217,1)_0%,rgba(77,10,205,1)_100%)]">
            <StarIcon className="w-[14.66px] h-[14.65px] fill-white text-white" />
            <span className="[font-family:'Sora',Helvetica] font-semibold text-white text-sm tracking-[0] leading-[normal]">
              Intervue Poll
            </span>
          </Badge>

          <div className="flex flex-col w-[737px] items-center gap-[5px]">
            <h1 className="self-stretch [font-family:'Sora',Helvetica] font-normal text-black text-[40px] text-center tracking-[0] leading-[normal]">
              <span className="[font-family:'Sora',Helvetica] font-normal text-black text-[40px] tracking-[0]">
                Welcome to the{" "}
              </span>
              <span className="font-semibold">Live Polling System</span>
            </h1>

            <p className="self-stretch [font-family:'Sora',Helvetica] font-normal text-[#00000080] text-[19px] text-center tracking-[0] leading-[normal]">
              Please select the role that best describes you to begin using the
              live polling system
            </p>
          </div>
        </div>

        <div className="flex items-start gap-[32px]">
          {roleOptions.map((role) => (
            <Card
              key={role.id}
              className={`w-[387px] h-[143px] cursor-pointer transition-all ${
                selectedRole === role.id
                  ? "rounded-[10px] overflow-hidden border-[none] before:content-[''] before:absolute before:inset-0 before:p-[3px] before:rounded-[10px] before:[background:linear-gradient(150deg,rgba(119,101,218,1)_0%,rgba(29,104,189,1)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none"
                  : "rounded-[10px] border border-solid border-[#d9d9d9]"
              }`}
              onClick={() => setSelectedRole(role.id)}
            >
              <CardContent className="flex flex-col items-start justify-center gap-[17px] pl-[25px] pr-[17px] py-[15px] h-full p-0">
                <div className="flex flex-col items-start justify-center gap-[9px]">
                  <div className="flex items-end justify-center gap-[11px]">
                    <h2 className="[font-family:'Sora',Helvetica] font-semibold text-black text-[23px] tracking-[0] leading-[normal] whitespace-nowrap">
                      {role.title}
                    </h2>
                  </div>
                </div>

                <p className="[font-family:'Sora',Helvetica] font-normal text-[#454545] text-base tracking-[0] leading-[normal]">
                  {role.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button className="w-[234px] h-[58px] flex items-center justify-center gap-2.5 px-[70px] py-[17px] rounded-[34px] bg-[linear-gradient(159deg,rgba(143,100,225,1)_0%,rgba(29,104,189,1)_100%)] hover:bg-[linear-gradient(159deg,rgba(143,100,225,1)_0%,rgba(29,104,189,1)_100%)] hover:opacity-90">
          <span className="[font-family:'Sora',Helvetica] font-semibold text-white text-lg tracking-[0] leading-[normal]">
            Continue
          </span>
        </Button>
      </div>
    </div>
  );
};
