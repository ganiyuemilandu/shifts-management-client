import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "@components/accessories";
import { refreshSession } from "@/utils/handlers";
import RootLayout from "./layout";


export const router = createBrowserRouter([
	{
		path: "/",
		element: <RootLayout />,
		loader: refreshSession,
		children: [
			{
				index: true,
				lazy: () => import("@/pages")
			},
			{
				path: "register",
				lazy: () => import("@pages/register"),
			},
			{
				path: "login",
				lazy: () => import("@pages/login")
			},
			{
				element: <ProtectedRoute role="staff" />,
				children: [
					{
						path: "profile",
						lazy:	 () => import("@pages/profile")
					},

					{
						path: "assignments",
						children: [
							{
								index: true,
								lazy: () => import("@pages/assignments")
							},
							{
								path: ":staffId/:shiftId",
								lazy: () => import("@pages/assignments/staffId/shiftId")
							}
						]
					}
				]
			}
		]
	},

	{
		path: "/admin",
		element: <RootLayout />,
		loader: refreshSession,
		children: [
			{
				element: <ProtectedRoute role="admin" />,
				children: [
					{
						path: "assignments",
						children: [
							{
								path: "staff/:id",
								lazy: () => import("@admin/assignments/staff/id")
							},
							{
								path: "shift/:id",
								lazy: () => import("@admin/assignments/shift/id")
							}
						]
					},

					{
						path: "shifts",
						children: [
							{
								index: true,
								lazy: () => import("@admin/shifts")
							},
							{
								path: ":id",
								lazy: () => import("@admin/shifts/id")
							},
							{
								path: "schedule",
								lazy: () => import("@admin/shifts/schedule")
							},
							{
								path: "schedule/:id",
								lazy: () => import("@admin/shifts/schedule/id")
							}
						]
					},

					{
						path: "users",
						children: [
							{
								index: true,
								lazy: () => import("@admin/users")
							},
							{
								path: "new",
								lazy: () => import("@admin/users/new")
							},
							{
								path: ":id",
								lazy: () => import("@admin/users/id")
							}
						]
					}
				]
			}
		]
	}
]);