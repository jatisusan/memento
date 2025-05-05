import { useCallback, useState } from "react";
import { useDropzone, FileWithPath } from "react-dropzone";
import { Button } from "../ui/button";

type ProfileUploaderProps = {
	fieldChange: (FILES: File[]) => void;
	mediaUrl: string;
};

const ProfileUploader = ({ fieldChange, mediaUrl }: ProfileUploaderProps) => {
	const [fileUrl, setFileUrl] = useState(mediaUrl);
	const [file, setFile] = useState<File[]>([]);

	const onDrop = useCallback(
		(acceptedFiles: FileWithPath[]) => {
			setFile(acceptedFiles);
			fieldChange(acceptedFiles);
			setFileUrl(URL.createObjectURL(acceptedFiles[0]));
		},
		[file]
	);
	const { getRootProps, getInputProps } = useDropzone({
		onDrop,
		accept: { "image/*": [".png", ".jpeg", ".jpg", ".svg"] },
	});

	return (
		<div
			{...getRootProps()}
			className="cursor-pointer"
		>
			<input {...getInputProps()} className="cursor-pointer" />
			
				<div className="cursor-pointer flex-center gap-8 mb-6">
					<img
						src={fileUrl || "/assets/icons/profile-placeholder.svg"} 
						alt="profile"
						className="h-24 w-24 rounded-full object-cover object-top"
					/>
					
					<p className="text-primary-500 small-regular md:bbase-semibold">Change profile photo</p>

				</div>
		</div>
	);
};

export default ProfileUploader;
