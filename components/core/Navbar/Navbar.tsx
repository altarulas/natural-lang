"use client";

import { Logout } from "../Logout/Logout";
import { IoSettingsOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux-store/store";
import { Button } from "../../ui/button";
import Link from "next/link";
import { Skeleton } from "../../ui/skeleton";
import { useEffect, useState } from "react";
import { finishSession, saveLeftTime } from "@/redux-store/features/essayStore";
import styles from "./Navbar.module.scss";
import { toast } from "@/components/ui/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Lottie from "lottie-react";
import WaspAnimation from "@/utils/WaspAnimation.json";
import { PremiumDialog } from "../PremiumDialog/PremiumDialog";

export const Navbar = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { status } = useSelector(
    (state: RootState) => state.userInfoStore.user.subscription_info
  );

  const { user, isLoadingInfoStore } = useSelector(
    (state: RootState) => state.userInfoStore
  );

  const { sessionConditions } = useSelector(
    (state: RootState) => state.essayStore
  );

  const [time, setTime] = useState<number>(0);
  const [remainingTime, setRemainingTime] = useState<string | null>(null);

  useEffect(() => {
    if (sessionConditions.is_timer_running) {
      // Function to calculate remaining time
      const calculateRemainingTime = () => {
        const endTimeStr = localStorage.getItem("countdown_end_time");
        if (endTimeStr) {
          const endTime = parseInt(endTimeStr, 10);
          const currentTime = Date.now();
          const timeDifference = endTime - currentTime;
          if (timeDifference > 0) {
            setTime(Math.floor(timeDifference / 1000)); // Convert milliseconds to seconds
          } else {
            setTime(0);
          }
        }
      };

      // Call calculateRemainingTime initially
      calculateRemainingTime();

      // Interval to update remaining time every second
      const interval = setInterval(calculateRemainingTime, 1000);

      // Cleanup interval
      return () => clearInterval(interval);
    } else return;
  }, [sessionConditions.is_timer_running]);

  useEffect(() => {
    if (
      sessionConditions.is_session_finished &&
      sessionConditions.show_timer &&
      !sessionConditions.left_timer
    ) {
      const leftTime = formatTime(time);
      leftTime && dispatch(saveLeftTime(leftTime));
    } else return;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    sessionConditions.is_session_finished,
    sessionConditions.show_timer,
    sessionConditions.left_timer,
  ]);

  useEffect(() => {
    if (sessionConditions.left_timer) {
      setRemainingTime(sessionConditions.left_timer);
    }
  }, [sessionConditions.left_timer]);

  const formatTime = (time: number, type?: string) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;

    if (minutes === 0 && seconds === 1) {
      dispatch(saveLeftTime("00:00:00"));
      dispatch(finishSession());
      toast({ title: "Your time has finished", variant: "destructive" });
      return;
    }

    if (type === "h") {
      return `${hours.toString().padStart(2, "0")}`;
    } else if (type === "m") {
      return `${minutes.toString().padStart(2, "0")}`;
    } else if (type === "s") {
      return `${seconds.toString().padStart(2, "0")}`;
    } else {
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
  };

  const isFormattedTimeAvailable = (): boolean => {
    return (
      (sessionConditions.show_timer || sessionConditions.is_timer_running) &&
      !sessionConditions.left_timer
    );
  };

  const isRemainingTimeAvailable = (): boolean => {
    return (
      sessionConditions.show_timer &&
      !sessionConditions.is_timer_running &&
      !!sessionConditions.left_timer
    );
  };

  const getTimePart = (time: string | null, type: string) => {
    if (!time) return;

    const [hours, minutes, seconds] = time.split(":");
    switch (type) {
      case "h":
        return hours;
      case "m":
        return minutes;
      case "s":
        return seconds;
      default:
        return "";
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.logoWrapper}>
        <div className={styles.logo}>
          Essay Wasp
          <div className="w-16 h-16">
            <Lottie animationData={WaspAnimation} loop={true} />
          </div>
        </div>

        {isFormattedTimeAvailable() && (
          <div className="flex justify-center items-center gap-1">
            <div className={styles.time}>{formatTime(time, "h")}</div>
            {`:`}
            <div className={styles.time}>{formatTime(time, "m")}</div>
            {`:`}
            <div className={styles.time}>{formatTime(time, "s")}</div>
          </div>
        )}

        {isRemainingTimeAvailable() && (
          <div className="flex justify-center items-center gap-1">
            <div className={styles.time}>{getTimePart(remainingTime, "h")}</div>
            {`:`}
            <div className={styles.time}>{getTimePart(remainingTime, "m")}</div>
            {`:`}
            <div className={styles.time}>{getTimePart(remainingTime, "s")}</div>
          </div>
        )}
      </div>

      <div className={styles.menuWrapper}>
        <div className={styles.creditWrapper}>
          {!status ? (
            isLoadingInfoStore ? (
              <Skeleton className="w-60 h-10" />
            ) : (
              <>
                <Button variant="outline" className={styles.credit}>
                  credits: {user.credits}
                </Button>

                <PremiumDialog />
              </>
            )
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button className={styles.button}>Premium</Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>You have unlimited credits!</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <Link href="/reports">
          <Button variant="ghost" className="rounded-sm h-8 hover:bg-white">
            Reports
          </Button>
        </Link>

        <Link href="/settings">
          <IoSettingsOutline className={styles.settings} />
        </Link>

        <Logout />
      </div>
    </div>
  );
};
