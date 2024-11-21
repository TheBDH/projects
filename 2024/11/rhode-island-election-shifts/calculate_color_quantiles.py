import csv
import sys

def read_csv_column(file_name, column_name):
    data = []
    try:
        with open(file_name, 'r', newline='', encoding='utf-8-sig') as csvfile:
            reader = csv.DictReader(csvfile)
            if column_name not in reader.fieldnames:
                print(f"Column '{column_name}' not found in the CSV file.")
                sys.exit(1)
            for row in reader:
                value = row[column_name]
                try:
                    data.append(float(value))
                except ValueError:
                    pass  # Skip non-numeric values
    except FileNotFoundError:
        print(f"File '{file_name}' not found.")
        sys.exit(1)
    return data

def jenks_breaks(data_list, num_classes):
    data_list.sort()
    data_len = len(data_list)
    if num_classes > data_len:
        raise ValueError("Number of classes must be less than or equal to the number of data points.")

    # Initialize matrices
    mat1 = [[0] * (num_classes + 1) for _ in range(data_len + 1)]
    mat2 = [[float('inf')] * (num_classes + 1) for _ in range(data_len + 1)]
    for i in range(1, num_classes + 1):
        mat1[0][i] = 1
        mat2[0][i] = 0.0

    for l in range(1, data_len + 1):
        s1 = s2 = w = 0.0
        for m in range(1, l + 1)[::-1]:
            val = data_list[m - 1]
            s1 += val
            s2 += val ** 2
            w += 1
            variance = s2 - (s1 ** 2) / w
            if m > 1:
                for j in range(2, num_classes + 1):
                    if mat2[l][j] >= variance + mat2[m - 1][j - 1]:
                        mat1[l][j] = m
                        mat2[l][j] = variance + mat2[m - 1][j - 1]
            else:
                break
        mat1[l][1] = 1
        mat2[l][1] = variance

    # Build the breaks
    k = data_len
    kclass = [0.0] * (num_classes + 1)
    kclass[num_classes] = data_list[-1]
    countNum = num_classes
    while countNum >= 2:
        idx = int(mat1[k][countNum]) - 1
        kclass[countNum - 1] = data_list[idx]
        k = idx
        countNum -= 1
    kclass[0] = data_list[0]

    return kclass

def main():
    if len(sys.argv) != 4:
        print("Usage: script.py data.csv num_breaks column_name")
        sys.exit(1)
    file_name = sys.argv[1]
    num_breaks = int(sys.argv[2])
    column_name = sys.argv[3]
    data = read_csv_column(file_name, column_name)
    if not data:
        print(f"No valid numeric data found in column '{column_name}'.")
        sys.exit(1)
    try:
        breaks = jenks_breaks(data, num_breaks)
    except ValueError as e:
        print(e)
        sys.exit(1)
    print("Jenks Natural Breaks:")
    for i in range(len(breaks) - 1):
        print(f"Class {i + 1}: {breaks[i]} to {breaks[i + 1]}")

if __name__ == '__main__':
    main()