import React, { useState, useEffect } from "react";
import { IKContext, IKUpload } from "imagekitio-react";

const ImageUpload = ({ onSuccess, onError, existingUrl }) => {
  const [authParams, setAuthParams] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAuth = async () => {
      try {
        const response = await fetch("/api/imagekit-auth");
        const data = await response.json();
        console.log("Auth params received:", data);
        setAuthParams(data);
      } catch (err) {
        console.error("Failed to get auth parameters:", err);
        onError?.("Failed to initialize upload");
      }
    };

    fetchAuth();
  }, []);

  const handleSuccess = (response) => {
    console.log("ImageKit Upload Success Response:", response);
    const imageUrl = response.url;
    if (!imageUrl) {
      console.error("No URL in ImageKit response:", response);
      onError?.("Failed to get image URL from upload response");
      return;
    }

    console.log("Sending image URL to parent:", imageUrl);
    onSuccess?.(imageUrl);
    setIsLoading(false);
  };

  const handleError = (err) => {
    console.error("Upload Error:", err);
    onError?.(err.message);
    setIsLoading(false);
  };

  const handleUploadStart = () => {
    console.log("Upload started");
    setIsLoading(true);
  };

  if (!authParams) {
    return <div>Loading uploader...</div>;
  }

  return (
    <div className="image-upload-container">
      {existingUrl && (
        <div className="preview">
          <img src={existingUrl} alt="Current" />
        </div>
      )}

      <IKContext
        urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}
        publicKey={process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY}
        authenticator={() => {
          console.log("Authenticator called with params:", authParams);
          return Promise.resolve(authParams);
        }}
      >
        <IKUpload
          fileName={`character-${Date.now()}`}
          folder="/characters"
          tags={["character"]}
          useUniqueFileName={true}
          onSuccess={handleSuccess}
          onError={handleError}
          onUploadStart={handleUploadStart}
          validateFile={(file) => {
            console.log("Validating file:", file);
            const validTypes = [
              "image/jpeg",
              "image/png",
              "image/gif",
              "image/webp",
            ];
            if (!validTypes.includes(file.type)) {
              onError?.(
                `Invalid file type. Allowed types: ${validTypes.join(", ")}`
              );
              return false;
            }
            if (file.size > 5 * 1024 * 1024) {
              onError?.("File size must be less than 5MB");
              return false;
            }
            return true;
          }}
        />
      </IKContext>

      {isLoading && <div>Uploading...</div>}

      <style jsx>{`
        .image-upload-container {
          margin: 1rem 0;
        }

        .preview {
          margin-bottom: 1rem;
        }

        .preview img {
          max-width: 200px;
          max-height: 200px;
          border-radius: 4px;
        }

        :global(.ik-upload-button) {
          background: #007bff;
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
          margin-bottom: 1rem;
        }

        :global(.ik-upload-button:hover) {
          background: #0056b3;
        }
      `}</style>
    </div>
  );
};

export default ImageUpload;
