import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

const Home = () => {
  const router = useRouter();

  return (
    <div className="bg-gray-900 min-h-screen flex flex-col items-center justify-center text-white">
      <h1 className="text-blue-400 text-6xl font-bold mb-10">
        <Link href="/">
          <a>Vesting Scheduler</a>
        </Link>
      </h1>
      <h2 className="text-blue-400 text-3xl font-semibold mb-12">
        Are You A ______?
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="bg-gray-800 p-8 rounded-lg text-center">
          <h2 className="text-red-500 text-3xl font-bold mb-6">Organization</h2>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white py-3 px-6 rounded-full text-xl font-bold w-full"
            onClick={() => router.push("/organization")}
          >
            Create / View My Organization
          </button>
        </div>
        <div className="bg-gray-800 p-8 rounded-lg text-center">
          <h2 className="text-red-500 text-3xl font-bold mb-6">Shareholder</h2>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white py-3 px-6 rounded-full text-xl font-bold w-full"
            onClick={() => router.push("/withdraw")}
          >
            Withdraw Tokens
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
