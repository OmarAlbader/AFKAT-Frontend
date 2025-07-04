import { yupResolver } from "@hookform/resolvers/yup";
import { Image, Info, Package, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import * as yup from "yup";
import Input from "../components/form/Input";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { IGame } from "../interfaces";
import { createGame } from "../redux/modules/games";

type IAddGameFormData = Pick<IGame, "title" | "description">;

const validationSchema = yup.object({
  title: yup
    .string()
    .required("Game title is required")
    .max(20, "Title must be at most 20 characters"),
  description: yup
    .string()
    .required("Description is required")
    .min(20, "Description must be at least 20 characters"),
  // tags: yup
  //   .array()
  //   .min(1, "Select at least one tag")
  //   .defined()
  //   .of(yup.string()),
  // version: yup.string().required("Version is required"),
  // price: yup.string().required("Price is required"),
  // isMultiplayer: yup.boolean(),
  // releaseDate: yup.string(),
});

const PublishGame = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IAddGameFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      title: "",
      description: "",
      // thumbnail: null,
      // tags: [],
      // version: "1.0.0",
      // price: "Free",
      // isMultiplayer: false,
    },
  });

  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.loading);

  const [activeStep, setActiveStep] = useState(1);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedThumbnail, setUploadedThumbnail] = useState<File | null>(null);
  const [uploadedWebGLFile, setUploadedWebGLFile] = useState<File | null>(null);
  const [uploadedWindowsFile, setUploadedWindowsFile] = useState<File | null>(
    null,
  );
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const WebGLfileInputRef = useRef<HTMLInputElement>(null);
  const WindowsfileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const tags = [
    "Action",
    "Adventure",
    "RPG",
    "Strategy",
    "Simulation",
    "Sports",
    "Puzzle",
    "Racing",
    "Fighting",
    "Shooter",
    "Horror",
    "Cards Game",
    "Educational",
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleFileDrop = (buildType: string, e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);

    if (files.length > 1) {
      toast.error(
        <div>
          <h1 className="mb-2 font-bold">Only one archive file is allowed.</h1>
          <p className="font-light">
            Please package all your game files in a single ZIP or RAR file.
          </p>
        </div>,
      );
      return;
    }

    const fileSize = files[0].size / 1024 / 1024 / 1024; // Convert to GB
    if (fileSize > 1) {
      toast.error(
        <div>
          <h1 className="mb-2 font-bold">File too large</h1>
          <p className="font-light">
            Your game file exceeds the 1GB size limit. Please compress your
            files or reduce content.
          </p>
        </div>,
      );
      return;
    }
    handleFileUpload(files, buildType);
  };

  const handleFileUpload = (files: File[], buildType: string) => {
    if (!files.length) return; // No files selected

    const file = files[0];

    const fileSize = file.size / 1024 / 1024 / 1024; // Convert to GB
    if (fileSize > 1) {
      toast.error(
        <div>
          <h1 className="mb-2 font-bold">File too large</h1>
          <p className="font-light">
            Your game file exceeds the 1GB size limit. Please compress your
            files or reduce content.
          </p>
        </div>,
      );
      return;
    }
    const isValidType =
      file.type === "application/zip" ||
      file.type === "application/x-zip-compressed" ||
      file.name.endsWith(".zip") ||
      file.name.endsWith(".rar");

    if (!isValidType) {
      toast.error("Please upload ZIP or RAR files only");
    }

    if (buildType === "WebGL") {
      setUploadedWebGLFile(file);
    } else if (buildType === "Windows") {
      setUploadedWindowsFile(file);
    }
  };

  const handleRemoveFile = (buildType: string) => {
    if (buildType === "WebGL") {
      setUploadedWebGLFile(null);

      if (WebGLfileInputRef.current) WebGLfileInputRef.current.value = "";
    } else if (buildType === "Windows") {
      setUploadedWindowsFile(null);

      if (WindowsfileInputRef.current) WindowsfileInputRef.current.value = "";
    }
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);

    // Filter for image files
    const imageFile = files.find(
      (file) =>
        file.type.startsWith("image/") &&
        (file.type === "image/jpeg" ||
          file.type === "image/png" ||
          file.type === "image/webp"),
    );

    if (imageFile) {
      // Check file size
      if (imageFile.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      setUploadedThumbnail(imageFile);

      // Process the image
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
      };
      reader.readAsDataURL(imageFile);
    } else {
      toast.error("Please upload a valid image file (JPG, PNG, WebP)");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      setUploadedThumbnail(file);

      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];

    setSelectedTags(newTags);
  };

  const onSubmit = handleSubmit((data) => {
    if (activeStep === 3) {
      if (!uploadedWebGLFile) {
        toast.error("Please make sure to upload game files (WebGl)");
        return;
      }
    }

    const formData = new FormData();
    const fileFormat = uploadedWebGLFile?.name.split(".").pop();

    formData.append("title", data.title);
    formData.append("description", data.description);
    if (selectedTags.length > 0) {
      selectedTags.map((tag) => {
        formData.append("tags", tag);
      });
    }
    if (uploadedThumbnail) formData.append("thumbnail", uploadedThumbnail);
    if (uploadedWebGLFile) formData.append("game_file", uploadedWebGLFile);
    if (uploadedWindowsFile) {
      formData.append("game_file_win", uploadedWindowsFile);
    } else {
      formData.append("game_file_win", "");
    }
    if (fileFormat) formData.append("fileFormat", fileFormat);

    dispatch(createGame(formData));
  });

  const nextStep = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const errors: string[] = [];
    // For step 1, validate title, description, version
    if (activeStep === 1) {
      const titleValue = document.getElementById("title") as HTMLInputElement;
      const descValue = document.getElementById(
        "description",
      ) as HTMLTextAreaElement;

      // Collect all errors
      if (!titleValue?.value) {
        errors.push("Please enter a game title");
      } else if (titleValue.value.length > 20) {
        errors.push("Title must be at most 20 characters");
      }

      if (!descValue?.value) {
        errors.push("Description is required");
      } else if (descValue.value.length < 20) {
        errors.push("Description must be at least 20 characters");
      }
    }

    // For step 2, validate image and Tags
    if (activeStep === 2) {
      if (!uploadedImage) {
        errors.push("Please upload a cover image");
      }

      if (selectedTags.length === 0) {
        errors.push("Please select at least one tag");
      }
    }

    // If there are errors, show them all at once
    if (errors.length > 0) {
      // Option 1: Show all errors in a single toast
      toast.error(
        <div>
          <p className="mb-2 font-bold">Please fix the following errors:</p>
          <ul className="list-disc pl-4">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>,
        {
          autoClose: 5000, // Give users more time to read all errors
          className: "error-toast",
        },
      );
      return;
    }

    // If all validations pass, increment the step
    if (activeStep < 3) {
      setActiveStep(activeStep + 1);
    }
  };

  const prevStep = () => {
    if (activeStep > 1) setActiveStep(activeStep - 1);
  };

  return (
    <div className="w-full overflow-y-auto">
      <form
        className="border-primary focus-within:shadow-primary/25 relative mx-auto my-10 flex h-fit w-[85%] max-w-4xl flex-col items-start rounded-2xl border-2 bg-[#121015] shadow-md duration-500 focus-within:shadow-lg"
        onSubmit={onSubmit}
      >
        {/* Header */}
        <div className="w-full border-b border-white/10 p-6">
          <h1 className="text-2xl font-bold">Upload Your Game</h1>
          <p className="text-sm text-white/70">
            Share your creation with thousands of players around the world
          </p>
        </div>

        {/* Progress Steps */}
        <div className="w-full px-6 pt-4">
          <div className="flex justify-between">
            <div className={`flex flex-col items-center`}>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${activeStep >= 1 ? "bg-primary text-black" : "bg-white/20"}`}
              >
                <Package size={20} />
              </div>
              <span className="mt-2 text-sm">Game Details</span>
            </div>
            <div className="relative flex-1">
              <div
                className={`absolute top-5 h-1 w-full ${activeStep >= 2 ? "bg-primary" : "bg-white/20"}`}
              />
            </div>
            <div className={`flex flex-col items-center`}>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${activeStep >= 2 ? "bg-primary text-black" : "bg-white/20"}`}
              >
                <Image size={20} />
              </div>
              <span className="mt-2 text-sm">Media & Tags</span>
            </div>
            <div className="relative flex-1">
              <div
                className={`absolute top-5 h-1 w-full ${activeStep >= 3 ? "bg-primary" : "bg-white/20"}`}
              />
            </div>
            <div className={`flex flex-col items-center`}>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${activeStep >= 3 ? "bg-primary text-black" : "bg-white/20"}`}
              >
                <Upload size={20} />
              </div>
              <span className="mt-2 text-sm">Upload Files</span>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="w-full flex-1 p-6">
          {/* Step 1: Basic Info */}
          {activeStep === 1 && (
            <div className="grid grid-cols-1! gap-6 md:grid-cols-2!">
              <div className="col-span-1 md:col-span-2">
                <label
                  className="mb-2 block text-sm font-medium"
                  htmlFor="title"
                >
                  Game Title
                  <span className="ml-1 text-red-400">*</span>
                </label>
                <Input
                  placeholder="Enter your game title"
                  className="w-full"
                  id="title"
                  {...register("title")}
                />
                {errors.title && (
                  <p className="mt-1 text-xs text-red-400">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="col-span-1 md:col-span-2">
                <label
                  className="mb-2 block text-sm font-medium"
                  htmlFor="description"
                >
                  Description
                  <span className="ml-1 text-red-400">*</span>
                </label>
                <textarea
                  id="description"
                  className="focus:border-primary field-sizing-content min-h-[150px] w-full rounded border border-white/10 bg-white/5 px-4 py-2 text-white transition-colors outline-none"
                  placeholder="Describe your game (features, story, etc.)"
                  {...register("description")}
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-red-400">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  className="mb-2 block text-sm font-medium"
                  htmlFor="version"
                >
                  Version
                </label>
                <Input
                  id="version"
                  placeholder="1.0.0"
                  className="w-full"
                  // {...register("version")}
                />
              </div>

              <div>
                <label
                  className="mb-2 block text-sm font-medium"
                  htmlFor="release"
                >
                  Release Date
                </label>
                <Input
                  id="release"
                  type="date"
                  className="w-full"
                  // {...register("releaseDate")}
                />
              </div>

              <div>
                <label
                  className="mb-2 block text-sm font-medium"
                  htmlFor="price"
                >
                  Price
                </label>
                <select
                  id="price"
                  className="focus:border-primary w-full rounded border border-white/10 bg-white/5 px-4 py-2 text-white transition-colors outline-none focus:bg-[#1E1C21]"
                  // {...register("price")}
                >
                  <option value="Free">Free</option>
                  <option value="$0.99">$0.99</option>
                  <option value="$1.99">$1.99</option>
                  <option value="$2.99">$2.99</option>
                  <option value="$4.99">$4.99</option>
                  <option value="$9.99">$9.99</option>
                  <option value="$14.99">$14.99</option>
                  <option value="$19.99">$19.99</option>
                </select>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="text-primary h-4 w-4 rounded border-white/10 bg-white/5 transition-colors"
                    // {...register("isMultiplayer")}
                  />
                  <span className="text-sm font-medium">
                    Multiplayer Support
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Step 2: Media & Tags */}
          {activeStep === 2 && (
            <div className="space-y-6">
              {/* Cover Image */}
              <div className="flex flex-col">
                <label className="mb-2 block text-sm font-medium">
                  Cover Image
                  <span className="ml-1 text-red-400">*</span>
                </label>
                <div
                  className="hover:border-primary border-primary/20 flex aspect-video w-full max-w-3xl cursor-pointer flex-col items-center justify-center self-center rounded border-2 border-dashed bg-white/5 transition-colors"
                  onClick={() => imageInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDrop={handleImageDrop}
                >
                  {uploadedImage ? (
                    <div className="relative h-full w-full">
                      <img
                        src={uploadedImage}
                        alt="Cover"
                        className="h-full w-full rounded object-cover"
                      />
                      <button
                        type="button"
                        className="absolute top-2 right-2 rounded-full bg-black/70 p-1 text-white hover:bg-black"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadedImage(null);
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6">
                      <Image size={48} className="mb-2 text-white/70" />
                      <p className="mb-1 text-white/70">
                        Click or drop an image here
                      </p>
                      <p className="text-xs text-white/50">
                        PNG, JPG, WebP up to 5MB
                      </p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  ref={imageInputRef}
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.webp"
                  multiple={false}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleImageUpload(e);
                      e.target.value = "";
                    }
                  }}
                />
              </div>

              {/* Tags */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Tags (select at least one)
                  <span className="ml-1 text-red-400">*</span>
                </label>
                <div className="flex flex-wrap justify-around gap-2 sm:justify-start">
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className={`rounded-full px-4 py-1 text-sm transition-colors ${
                        selectedTags.includes(tag)
                          ? "bg-primary border-primary border text-black"
                          : "hover:border-primary border border-white/30 bg-white/5"
                      }`}
                      onClick={() => handleTagToggle(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                {selectedTags.length === 0 && (
                  <p className="mt-1 text-xs text-red-400">
                    Select at least one tag
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Upload Files */}
          {activeStep === 3 && (
            <div className="space-y-6">
              <div className="flex justify-between px-10">
                <div className="flex flex-col justify-between">
                  <p className="mb-2 text-center">
                    WebGL Build<span className="ml-1 text-red-400">*</span>
                  </p>
                  <div
                    className="hover:border-primary/50 flex aspect-video cursor-pointer flex-col items-center justify-center rounded border border-dashed border-white/30 bg-white/5 transition-colors"
                    onClick={() => WebGLfileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleFileDrop("WebGL", e)}
                  >
                    <div className="flex flex-col items-center justify-center p-6">
                      <Upload size={48} className="mb-2 text-white/70" />
                      <p className="mb-1 text-center text-white/70">
                        Click to upload or drag and drop your game files
                      </p>
                      <p className="text-center text-xs text-white/50">
                        ZIP or RAR files only
                      </p>
                      <p className="mt-1 text-center text-xs text-white/40">
                        Maximum file size: 1GB
                      </p>
                    </div>
                  </div>
                </div>

                <input
                  type="file"
                  ref={WebGLfileInputRef}
                  className="hidden"
                  accept=".zip,.rar"
                  multiple={false}
                  onChange={(e) => {
                    if (e.target.files) {
                      handleFileUpload(Array.from(e.target.files), "WebGL");
                    }
                  }}
                />

                <div className="mx-10 mt-8 border border-white/10" />

                <div>
                  <p className="mb-2 text-center">
                    Windows Build{" "}
                    <span className="text-white/50">(Optional)</span>
                  </p>
                  <div
                    className="hover:border-primary/50 flex aspect-video cursor-pointer flex-col items-center justify-center rounded border border-dashed border-white/30 bg-white/5 transition-colors"
                    onClick={() => WindowsfileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleFileDrop("Windows", e)}
                  >
                    <div className="flex flex-col items-center justify-center p-6">
                      <Upload size={48} className="mb-2 text-white/70" />
                      <p className="mb-1 text-center text-white/70">
                        Click to upload or drag and drop your game files
                      </p>
                      <p className="text-center text-xs text-white/50">
                        ZIP or RAR files only
                      </p>
                      <p className="mt-1 text-center text-xs text-white/40">
                        Maximum file size: 1GB
                      </p>
                    </div>
                  </div>
                </div>

                <input
                  type="file"
                  ref={WindowsfileInputRef}
                  className="hidden"
                  accept=".zip,.rar"
                  multiple={false}
                  onChange={(e) => {
                    if (e.target.files) {
                      handleFileUpload(Array.from(e.target.files), "Windows");
                    }
                  }}
                />
              </div>

              {/* Uploaded Files */}
              {(uploadedWebGLFile || uploadedWindowsFile) && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Uploaded Files</p>
                  <div className="flex justify-between px-10">
                    {/* WebGL Files */}
                    <div className="flex flex-col gap-y-2">
                      {uploadedWebGLFile && (
                        <div className="flex items-center justify-between rounded bg-white/10 p-2">
                          <div className="flex items-center">
                            <Package className="mr-2 text-white/70" size={16} />
                            <span className="text-sm">
                              {uploadedWebGLFile.name}
                            </span>
                            <span className="ml-2 text-xs text-white/50">
                              (
                              {Math.round(
                                (uploadedWebGLFile.size / 1024 / 1024) * 10,
                              ) / 10}{" "}
                              MB)
                            </span>
                          </div>
                          <button
                            type="button"
                            className="text-white/70 hover:text-white"
                            onClick={() => handleRemoveFile("WebGL")}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Windows Files */}
                    <div className="flex flex-col gap-y-2">
                      {uploadedWindowsFile && (
                        <div className="flex items-center justify-between rounded bg-white/10 p-2">
                          <div className="flex items-center">
                            <Package className="mr-2 text-white/70" size={16} />
                            <span className="text-sm">
                              {uploadedWindowsFile.name}
                            </span>
                            <span className="ml-2 text-xs text-white/50">
                              (
                              {Math.round(
                                (uploadedWindowsFile.size / 1024 / 1024) * 10,
                              ) / 10}{" "}
                              MB)
                            </span>
                          </div>
                          <button
                            type="button"
                            className="text-white/70 hover:text-white"
                            onClick={() => handleRemoveFile("Windows")}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded bg-[#1A191F] p-4">
                <div className="flex items-start">
                  <Info size={20} className="text-primary mt-0.5 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium">
                      Guidelines for game submissions:
                    </h3>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-white/70">
                      <li>
                        Make sure your game does not contain prohibited content
                      </li>
                      <li>
                        Include any installation instructions or dependencies
                      </li>
                      <li>
                        Submit a playable build that doesn't require additional
                        downloads
                      </li>
                      <li>
                        Make sure your description accurately represents your
                        game
                      </li>
                      <li>
                        Our team will review your submission within 1-3 business
                        days
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="w-full border-t border-white/10 p-6">
          <div className="flex justify-between">
            <button
              type="button"
              className={`rounded px-6 py-2 ${activeStep === 1 ? "invisible" : "bg-white/10 hover:bg-white/20"}`}
              onClick={prevStep}
              disabled={activeStep === 1}
            >
              Previous
            </button>

            {activeStep < 3 ? (
              <button
                type="button"
                className="hover:bg-primary/80 bg-primary text-primary-content rounded px-6 py-2 font-bold"
                onClick={nextStep}
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="bg-primary hover:bg-primary text-primary-content rounded px-6 py-2 font-bold disabled:cursor-not-allowed! disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <svg
                      className="text-primary-content h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Submitting...</span>
                  </div>
                ) : (
                  <span>Submit Game</span>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default PublishGame;
