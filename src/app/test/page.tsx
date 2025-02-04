import { auth } from "@/auth";
import { redirect } from "next/navigation"; // 用于服务器端重定向
import LogoutButton from "../components/logout";

const TestPage = async () => {
    const session = await auth();

    if (!session?.user) {
        redirect("/login"); // 服务器端重定向到 /login
    }


    return (
        <div className="h-svh w-full flex items-center justify-center flex-col gap-5">
            <img src={session.user.image} alt="User Avatar" className="w-20 h-20"/>
            {/* <p className=" w-full">{JSON.stringify(session)}</p> */}
            <p>Session expires at: {session.expires}</p>
            <LogoutButton />
        </div>
    );
};

export default TestPage;