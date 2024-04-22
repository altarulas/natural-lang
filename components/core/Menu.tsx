"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppDispatch, RootState } from "@/redux-store/store";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../ui/button";
import {
  createFeedback,
  startEssaySession,
} from "@/redux-store/features/essayStore";
import { Timer } from "./Timer";

export const Menu = () => {
  const dispatch = useDispatch<AppDispatch>();

  const [selectedTopic, setSelectedTopic] = useState<string>("");

  const { essay_question, essay_text } = useSelector(
    (state: RootState) => state.essayStore
  );

  const handleSelectChange = (value: string) => {
    setSelectedTopic(value);
  };

  const handleCreateTopic = async () => {
    await dispatch(startEssaySession(selectedTopic));
  };

  const handleFinishEssay = async () => {
    await dispatch(
      createFeedback({
        essay_text: essay_text,
        essay_question: essay_question,
      })
    );
  };

  return (
    <>
      {essay_question && "time started..."}

      <div className="w-full gap-10 flex justify-center">
        <Select onValueChange={(value) => handleSelectChange(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select an Essay Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Essay Type</SelectLabel>
              <SelectItem value="opinion">Opinion</SelectItem>
              <SelectItem value="discussion">Discussion</SelectItem>
              <SelectItem value="solution">Solution</SelectItem>
              <SelectItem value="direct">Direct</SelectItem>
              <SelectItem value="adv">Advantages / Disadvantages</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Button onClick={handleCreateTopic}>Create Topic</Button>

        <Button onClick={handleFinishEssay}>Give Feedback</Button>

        <Timer />
      </div>
    </>
  );
};
