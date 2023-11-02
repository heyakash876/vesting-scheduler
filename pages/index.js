import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const Home = () => {
	const router = useRouter();

	return (
		<>
			<h1 className="text-blue-700 text-5xl font-bold text-center m-10">
				<a href="/">Vesting Scheduler</a>
			</h1>
			<h1 className="text-blue-700 text-3xl font-bold text-center m-20">
				Are You A ______?
			</h1>
			<div class="grid grid-cols-3 gap-12">
				<div>
					<h1 className="text-red-700 text-3xl font-bold text-center m-20">
						Organization
					</h1>
					<button
						class="flex bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-full text-xl font-bold text-center justify-center w-9/12 mx-auto"
						onClick={() => router.push("/organization")}
					>
						Create / View My Organization
					</button>
				</div>
				<div>
					<h1 className="text-blue-600 text-2xl font-bold text-center pt-32">
						OR
					</h1>
				</div>
				<div>
					<h1 className="text-red-700 text-3xl font-bold text-center m-20">
						Shareholder
					</h1>
					<button
						class="flex bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-full text-xl font-bold text-center justify-center w-9/12 mx-auto"
						onClick={() => router.push("/withdraw")}
					>
						Withdraw Tokens
					</button>
				</div>
			</div>
		</>
	);
};

export default Home;
