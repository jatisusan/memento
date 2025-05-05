import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useNavigate, useParams } from "react-router-dom";
import { useGetUserById, useUpdateUser } from "@/lib/react-query/queriesAndMutations";
import Loader from "@/components/shared/Loader";
import { ProfileValidation } from "@/lib/validation";
import { toast } from "sonner";
import { useUserContext } from "@/context/AuthContext";
import ProfileUploader from "@/components/shared/ProfileUploader";

const UpdateProfile = () => {
	const { id } = useParams();
	const navigate = useNavigate();

	const { user, setUser } = useUserContext();
	const { data: currentUser } = useGetUserById(id || "");
	const { mutateAsync: updateUser, isPending: isUpdatingUser } = useUpdateUser();

	// 1. Define your form.
	const form = useForm<z.infer<typeof ProfileValidation>>({
		resolver: zodResolver(ProfileValidation),
		defaultValues: {
			file: [],
			username: user.username,
			name: user.name,
			email: user.email,
			bio: user.bio,
		},
	});

	// 2. Define a submit handler.
	async function onSubmit(values: z.infer<typeof ProfileValidation>) {
		const updatedUser = await updateUser({
			userId: currentUser?.$id || '',
			name: values.name,
			username: values.username,
			bio: values.bio,
			imageId: currentUser?.imageId,
			imageUrl: currentUser?.imageUrl,
			file: values.file,
		});

		if(!updatedUser) {
			toast.error("Something went wrong. Please try again.");
		}

		setUser({
			...user,
			name: updatedUser?.name,
			username: updatedUser?.username,
			bio: updatedUser?.bio,
			imageUrl: updatedUser?.imageUrl,
		});

		toast.success("Profile updated successfully.", {unstyled: true, classNames: {toast: "bg-dark-3 p-6 flex-between rounded-xl", description: "text-light-2"}});

		return navigate(`/profile/${id}`);
	}

	if (!currentUser) {
		return (
			<div className="flex-center h-full w-full">
				<Loader />
			</div>
		);
	}

	return (
		<div className="flex flex-1">
			<div className="common-container">
				<div className="flex-start w-full max-w-5xl gap-3">
					<img
						src="/assets/icons/edit.svg"
						width={36}
						height={36}
						alt="edit"
						className="invert-white"
					/>
					<h2 className="h3-bold md:h2-bold w-full text-left">Edit Profile</h2>
				</div>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="flex flex-col gap-7 w-full max-w-5xl mt-4"
					>
						<FormField
							control={form.control}
							name="file"
							render={({ field }) => (
								<FormItem className="flex">
									<FormControl>
										<ProfileUploader fieldChange={field.onChange} mediaUrl={currentUser.imageUrl} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input type="text" className="shad-input" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="username"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Username</FormLabel>
									<FormControl>
										<Input type="text" className="shad-input" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input
											type="email"
											className="shad-input"
											disabled
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="bio"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Bio</FormLabel>
									<FormControl>
										<Input type="text" className="shad-input" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex justify-end gap-4">
							<Button type="button" className="shad-button_dark_4" onClick={() => navigate(-1)}>
								Cancel
							</Button>
							<Button type="submit" className="shad-button_primary" disabled={isUpdatingUser}>
								{ isUpdatingUser && <Loader /> }
								Submit
							</Button>
						</div>
					</form>
				</Form>
			</div>
		</div>
	);
};

export default UpdateProfile;
