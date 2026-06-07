import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreatePostForm } from "@/components/create-post/create-post-form";

export default function CreatePostPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Create Post</CardTitle>
          <CardDescription>Share a photo with your followers.</CardDescription>
        </CardHeader>
        <CardContent>
          <CreatePostForm />
        </CardContent>
      </Card>
    </div>
  );
}
