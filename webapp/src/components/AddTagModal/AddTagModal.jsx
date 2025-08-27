// components/AddTagModal/AddTagModal.jsx
import {
  Modal,
  TextInput,
  Button,
  ColorPicker,
  Text,
  CloseButton,
} from "@mantine/core";

export function AddTagModal({
  opened,
  onClose,
  client,
  tagValue,
  setTagValue,
  tagColorValue,
  setTagColorValue,
  onAddTag,
}) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Add Tag to @${client?.username}`}
      centered
    >
      <Text size={"sm"} mb={"xs"}>
        Tag Name
      </Text>
      <TextInput
        placeholder="example: personal computer, floor 1, etc."
        value={tagValue}
        onChange={(event) => setTagValue(event.currentTarget.value)}
        rightSection={
          <CloseButton
            aria-label="Clear tag"
            onClick={() => setTagValue("")}
            style={{ display: tagValue ? undefined : "none" }}
          />
        }
      />
      <Text size={"sm"} mt={"xs"}>
        Tag Color
      </Text>
      <ColorPicker
        value={tagColorValue}
        onChange={setTagColorValue}
        my={"md"}
        format="hex"
        swatches={[
          "#2e2e2e",
          "#868e96",
          "#fa5252",
          "#e64980",
          "#be4bdb",
          "#7950f2",
          "#4c6ef5",
          "#228be6",
          "#15aabf",
          "#12b886",
          "#40c057",
          "#82c91e",
          "#fab005",
          "#fd7e14",
        ]}
      />
      <Button fullWidth my={"sm"} onClick={() => onAddTag(client)}>
        Add Tag
      </Button>
    </Modal>
  );
}
