import React, { useState, useEffect } from "react";
import { useModal } from "../../hooks/useModal";
import { useAuth } from "../../context/AuthContext";
import { profileService } from "../../lib/profileService.ts";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";


const DEFAULT_AVATAR = "../../../public/owner.png";

export default function UserMetaCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const { user } = useAuth();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setError(null);
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setError("File size should be less than 5MB");
        return;
      }
      setSelectedFile(file);
      setError(null);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      closeModal();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("avatar", selectedFile);

      await profileService.updateProfile(formData);

      window.location.reload();
    } catch (err: any) {
      console.error("Failed to update avatar", err);
      setError(err.response?.data?.message || "Failed to upload image");
      setIsLoading(false);
    }
  };

  if (!user) return null;

  const currentAvatarUrl = user.avatar_url || DEFAULT_AVATAR;

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
              <img
                src={currentAvatarUrl}
                alt={user.full_name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {user.full_name}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center xl:text-left">
                {user.role === 'admin' ? 'Administrator' : 'User'}
              </p>
            </div>
          </div>
          <button
            onClick={openModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
          >
            <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206Z" fill="" />
            </svg>
            Edit
          </button>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">Edit Profile Photo</h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">Upload a new profile picture.</p>
          </div>

          {error && (
            <div className="mb-4 px-2 text-sm text-red-500">
              {error}
            </div>
          )}

          <form className="flex flex-col" onSubmit={handleSave}>
            <div className="custom-scrollbar h-[250px] overflow-y-auto px-2 pb-3">
              <div className="flex flex-col items-center gap-6">
                <div className="w-24 h-24 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
                  <img
                    src={previewUrl || currentAvatarUrl}
                    alt="user preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-full max-w-sm">
                  <Label>Profile Photo</Label>
                  <Input
                    type="file"

                    onChange={handleFileChange}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={closeModal}

                disabled={isLoading}
              >
                Close
              </Button>
              <Button
                size="sm"

                disabled={isLoading || !selectedFile}
              >
                {isLoading ? "Uploading..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}