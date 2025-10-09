import '@mantine/core/styles.css'
import '@mantine/dropzone/styles.css'

import {
  Badge,
  Button,
  Container,
  Group,
  MantineProvider,
  Radio,
  SimpleGrid,
  Text,
  Textarea,
  TextInput
} from '@mantine/core'
import { IconCheck, IconX } from '@tabler/icons-react'
import { Notifications, notifications } from '@mantine/notifications'
import { Dropzone } from '@mantine/dropzone'
import { useForm } from '@mantine/form'
import { useState } from 'react'

function App() {
  const [files, setFiles] = useState([])

  const form = useForm({
    initialValues: {
      title: '',
      description: '',
      priority: 'medium',
      files: []
    },
    validate: {
      title: (value) => (value.length < 1 ? 'Title is required' : null),
      description: (value) => (value.length < 1 ? 'Description is required' : null)
    }
  })

  const handleDrop = (droppedFiles) => {
    const newFiles = [...files, ...droppedFiles]
    setFiles(newFiles)
    form.setFieldValue('files', newFiles)
  }

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
    })
  }

  const handleSubmit = async (values) => {
    const filesData = await Promise.all(
      values.files.map(async (file) => ({
        name: file.name,
        type: file.type,
        size: file.size,
        data: await fileToBase64(file)
      }))
    )

    const issueData = {
      title: values.title,
      description: values.description,
      priority: values.priority,
      files: filesData,
      timestamp: new Date().toISOString()
    }

    const result = await window.electronAPI.submitIssue(issueData)

    if (result.status == 'success') {
      notifications.show({
        title: 'Success',
        message: `Uploaded issue successfully! (#${result.issueNumber})`,
        color: 'green',
        icon: <IconCheck size={14} />
      })
    } else {
      notifications.show({
        title: 'Error',
        message: 'Failed to upload issue!',
        color: 'red',
        icon: <IconX size={14} />
      })
    }
  }

  return (
    <MantineProvider forceColorScheme={'dark'}>
      <Notifications />
      <Container p={'md'}>
        <Text size={'xl'} ta={'center'}>
          Submit a support request
        </Text>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            placeholder={'Give a short title summarizing your issue'}
            label={'Title'}
            {...form.getInputProps('title')}
          />
          <Textarea
            mt={'md'}
            placeholder={'Please give a detailed description of your issue here'}
            label={'Description'}
            {...form.getInputProps('description')}
          />
          <Radio.Group
            mt={'md'}
            label="Priority"
            description={'Select the priority of your issue'}
            {...form.getInputProps('priority')}
          >
            <Group mt={'xs'}>
              <Radio value="low" label="Low" />
              <Radio value="medium" label="Medium" />
              <Radio value="high" label="High" />
            </Group>
          </Radio.Group>
          <Dropzone mt={'md'} onDrop={handleDrop} multiple>
            <Text ta={'center'}>Drag files here or click to select</Text>
          </Dropzone>
          <SimpleGrid cols={3} mt={'sm'}>
            {files.map((file, index) => (
              <Badge key={index} variant="light">
                {file.name}
              </Badge>
            ))}
          </SimpleGrid>
          <Button mt={'sm'} fullWidth type="submit">
            Submit
          </Button>
        </form>
      </Container>
    </MantineProvider>
  )
}

export default App
