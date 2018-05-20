module.exports = [
  {
    entityType: 'Host',
    groupName: 'Acquire',
    key: 'acquire.file',
    title: 'File',
    scope: 'list|details',
    params: [
      {
        type: 'string',
        name: 'req_filename',
        title: 'File Name',
        required: true
      },
      {
        type: 'string',
        name: 'req_path',
        title: 'Path',
        required: true,
        default: '%SYSTEMROOT%'
      },
      {
        type: 'option',
        name: 'req_use_api',
        title: 'Using',
        values: [
          {
            key: true,
            value: 'RAW',
            default: true
          },
          {
            key: false,
            value: 'API'
          }
        ]
      },
      {
        type: 'text',
        name: 'comment',
        title: 'Comment'
      }
    ]
  },
  {
    entityType: 'Host',
    groupName: 'Acquire',
    key: 'acquire.triage',
    title: 'Triage',
    scope: 'list|details',
    params: [
      {
        type: 'string',
        name: 'req_timestamp',
        title: 'Timestamp'
      }
    ]
  },
  {
    entityType: 'Host',
    groupName: 'Acquire',
    key: 'acquire.full.disk',
    title: 'Full Disk',
    scope: 'list|details',
    params: [
      {
        type: 'string',
        name: 'req_path',
        title: 'Path',
        default: '\\\\.\\'
      },
      {
        type: 'string',
        name: 'req_filename',
        title: 'Filename'
      },
      {
        type: 'int',
        name: 'req_offset',
        title: 'Offset'
      },
      {
        type: 'int',
        name: 'req_size',
        title: 'Size'
      }
    ]
  },
  {
    entityType: 'Host',
    groupName: 'Delete',
    key: 'delete.host',
    title: 'Delete Host',
    scope: 'list|details',
    disabled: true
  },
  {
    entityType: 'Host',
    groupName: 'Investigation',
    key: 'case.from.host',
    title: 'Start Host Investigation',
    scope: 'list|details'
  }
];
