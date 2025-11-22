# TODO: Add Edit/Delete Buttons to Forum Pages

## ForumTopic.tsx

Add these buttons to each post (after the vote buttons):

```tsx
// Helper function to check if within 5 minutes
const canEditOrDelete = (createdAt: Date) => {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return new Date(createdAt) > fiveMinutesAgo;
};

// In the post rendering section:
{user && post.user_id === user.id && canEditOrDelete(post.created_at) && (
  <div className="flex gap-2 mt-2">
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleEditPost(post.id)}
    >
      <Edit className="h-4 w-4 mr-1" />
      Edit
    </Button>
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleDeletePost(post.id)}
    >
      <Trash className="h-4 w-4 mr-1" />
      Delete
    </Button>
  </div>
)}

// Add mutations:
const updatePostMutation = trpc.forum.updatePost.useMutation({
  onSuccess: () => {
    toast.success("Post updated!");
    utils.forum.getTopic.invalidate({ topicId });
  },
  onError: (error) => {
    toast.error(error.message);
  },
});

const deletePostMutation = trpc.forum.deletePost.useMutation({
  onSuccess: () => {
    toast.success("Post deleted!");
    utils.forum.getTopic.invalidate({ topicId });
  },
  onError: (error) => {
    toast.error(error.message);
  },
});
```

## Add translations to i18n.ts:

```typescript
// All languages:
editPost: "Edit Post",
deletePost: "Delete Post",
editTopic: "Edit Topic",
deleteTopic: "Delete Topic",
confirmDelete: "Are you sure you want to delete this?",
postUpdated: "Post updated successfully!",
postDeleted: "Post deleted successfully!",
topicUpdated: "Topic updated successfully!",
topicDeleted: "Topic deleted successfully!",
canOnlyEditWithin5Minutes: "You can only edit/delete within 5 minutes of posting",
```

## Note:
- Edit/Delete buttons only show for post owner
- Only visible within 5 minutes of posting
- Admin can always edit/delete (no time limit)
