import { getMyself, parseJiraCredentials } from "@/lib/jira";

export async function POST(request) {
  try {
    const payload = await request.json();
    const creds = parseJiraCredentials(payload);
    const me = await getMyself(creds);

    return Response.json({
      accountId: me.accountId,
      displayName: me.displayName,
    });
  } catch (error) {
    return Response.json({ error: error.message || "Failed to validate Jira credentials." }, { status: 400 });
  }
}
