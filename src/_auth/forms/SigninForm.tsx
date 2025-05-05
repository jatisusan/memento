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
import { toast } from "sonner";
import { SigninValidation } from "../../lib/validation";
import Loader from "../../components/shared/Loader";
import { Link, useNavigate } from "react-router-dom";
import { useSignInAccount } from "../../lib/react-query/queriesAndMutations";
import { useUserContext } from "../../context/AuthContext";

const SigninForm = () => {
	const { mutateAsync: signInAccount, isPending: isSigningIn } = useSignInAccount();

	const { checkAuthUser, isLoading: isUserLoading } = useUserContext();

	const navigate = useNavigate();

	// 1. Define your form.
	const form = useForm<z.infer<typeof SigninValidation>>({
		resolver: zodResolver(SigninValidation),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	// 2. Define a submit handler.
	async function onSubmit(values: z.infer<typeof SigninValidation>) {
		const session = await signInAccount({
			email: values.email,
			password: values.password,
		});

		if (!session) {
			toast.error("Sign in failed! Please try again.");
		}

		const isLoggedIn = await checkAuthUser();
		if (isLoggedIn) {
			form.reset();
			navigate("/");
		} else {
			return toast.error("Sign in failed! Please try again.");
		}
	}

	return (
		<Form {...form}>
			<div className="sm:w-420 flex-center flex-col">
				<img src="assets/images/logo.png" alt="memento" width={150} />
				<h2 className="h3-bold md:h2-bold pt-5">Login to your account</h2>
				<p className="text-light-3 small-medium md:base-regular mt-2">
					Welcome back, please enter your details
				</p>

				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="flex flex-col gap-5 mt-5 w-full"
				>
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input type="email" className="shad-input" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Password</FormLabel>
								<FormControl>
									<Input type="text" className="shad-input" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit" className="shad-button_primary" disabled={isSigningIn || isUserLoading ? true : false}>
						{isSigningIn || isUserLoading ? (
							<div className="flex-center gap-2">
								<Loader /> Please wait...
							</div>
						) : (
							"Sign In"
						)}
					</Button>

					<p className="text-light-2 text-center text-small-regular mt-2">
						Don't have an account yet?
						<Link
							to={"/sign-up"}
							className="text-primary-500 text-small-semibold ml-1"
						>
							Sign up
						</Link>
					</p>
				</form>
			</div>
		</Form>
	);
};

export default SigninForm;
