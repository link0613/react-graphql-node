module.exports = [
  {
    entityType: 'Alert',
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
    entityType: 'Alert',
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
    entityType: 'Alert',
    groupName: 'Investigation',
    key: 'case.from.alert',
    title: 'Start Alert Investigation',
    scope: 'list|details'
  }
];
