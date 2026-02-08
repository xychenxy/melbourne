  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setImageError(null);
    if (!file) {
      return;
    }
    if (!file.type.startsWith("image/")) {
      setImageError("Please select an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const [, base64 = ""] = result.split(",", 2);
      setValue("imageBase64", base64, { shouldDirty: true });
      setValue("imageFileType", file.type, { shouldDirty: true });

      const img = new Image();
      img.onload = () => {
        setValue("imageWidthInPx", img.width, { shouldDirty: true });
        setValue("imageHeightInPx", img.height, { shouldDirty: true });
      };
      img.src = result;
    };
    reader.onerror = () => {
      setImageError("Failed to read the image. Please try again.");
    };
    reader.readAsDataURL(file);
  };
