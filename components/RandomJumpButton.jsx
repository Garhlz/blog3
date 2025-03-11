"use client";

import { useRouter } from "next/navigation";
import { Shuffle } from "lucide-react";

export default function RandomJumpButton({ problems }) {
  const router = useRouter();

  const handleRandomJump = () => {
    if (problems.length === 0) return;

    const randomIndex = Math.floor(Math.random() * problems.length);
    const { slug, problemName } = problems[randomIndex];
    const problemId = problemName.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");
    const url = `/post/${slug}#${problemId}`;
    router.push(url);
  };

  return (
    <button
      onClick={handleRandomJump}
      className={`inline-flex items-center px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed`}
      disabled={problems.length === 0}
    >
      <Shuffle className="h-4 w-4 mr-2" />
      随机跳题
    </button>
  );
}