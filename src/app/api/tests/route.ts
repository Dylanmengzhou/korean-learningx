import { NextRequest, NextResponse } from "next/server";
import { updateDictationStatus } from "@/app/actions/actions";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function POST(request: NextRequest) {
	try {
		const updates = await request.json();
		const userid = updates.userid;
        const id = updates.id;
        const dictationStatus = updates.dictationStatus;
        const res = await updateDictationStatus(userid,id, dictationStatus);

		if (!res.success) {
			return NextResponse.json(
				{ success: false, error: res.error },
				{ status: 500 }
			);
		}

		return NextResponse.json({
			success: true,
			data: res,
		});
	} catch (error: unknown) {
		console.error("POST /api/words 出错:", error);
		return NextResponse.json(
			{
				success: false,
				error:
					error instanceof Error ? error.message : "Error occurred",
			},
			{ status: 500 }
		);
	}
}
