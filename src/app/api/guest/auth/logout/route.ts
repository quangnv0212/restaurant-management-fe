import guestApiRequest from "@/apiRequests/guest";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
  if (!accessToken || !refreshToken) {
    return Response.json(
      {
        message: "Not found access token or refresh token",
      },
      {
        status: 200,
      }
    );
  }
  try {
    const result = await guestApiRequest.sLogout({
      accessToken,
      refreshToken,
    });
    return Response.json(result.payload);
  } catch (error) {
    console.log(error);
    return Response.json(
      {
        message: "An error occurred",
      },
      {
        status: 200,
      }
    );
  }
}
