import { Box } from '@mui/material';

export type CommentMention = { userId: string; displayName: string };

export const renderCommentText = (
  text: string,
  mentions?: CommentMention[],
  _avatarMap?: Record<string, string | null> // mantido por compatibilidade, não usado
) => {
  if (!mentions?.length) return <span>{text}</span>;

  const parts: React.ReactNode[] = [];
  let remaining = text;

  mentions.forEach((mention) => {
    const tag = `@${mention.userId}`;
    const idx = remaining.indexOf(tag);
    if (idx === -1) return;
    if (idx > 0) parts.push(<span key={`pre-${mention.userId}`}>{remaining.slice(0, idx)}</span>);

    parts.push(
      <Box
        key={mention.userId}
        component='span'
        sx={{ color: '#1877F2', fontWeight: 700, cursor: 'default' }}
      >
        @{mention.displayName}
      </Box>
    );
    remaining = remaining.slice(idx + tag.length);
  });

  if (remaining) parts.push(<span key='tail'>{remaining}</span>);
  return <>{parts}</>;
};
