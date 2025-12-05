import { styled } from '@mui/material/styles';
import TextareaAutosize from '@mui/material/TextareaAutosize';

export const StyledTextarea = styled(TextareaAutosize)(({ theme }) => ({
    width: "100%",
    fontSize: "0.9rem",
    fontFamily: theme.typography.fontFamily,
    padding: "8px 12px",
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.grey[400]}`,
    backgroundColor: theme.palette.background.paper,
    resize: "vertical",
    "&:focus": {
      borderColor: theme.palette.primary.main,
      outline: "none",
      boxShadow: `0 0 0 2px ${theme.palette.primary.main}40`,
    },
  }));